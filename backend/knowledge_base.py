"""
FAISS-based knowledge base for Atlan documentation
"""

import os
import json
import pickle
import numpy as np
from typing import List, Dict, Tuple
import faiss
from sentence_transformers import SentenceTransformer
from utils import DOC_SOURCES, extract_page_content, discover_documentation_pages
import hashlib

class AtlanKnowledgeBase:
    def __init__(self, model_name='all-MiniLM-L6-v2', index_path='knowledge_base'):
        self.model = SentenceTransformer(model_name)
        self.index_path = index_path
        self.index = None
        self.documents = []
        self.metadata = []
        self.dimension = 384  # Dimension for all-MiniLM-L6-v2
        
        # Create index directory if it doesn't exist
        os.makedirs(index_path, exist_ok=True)
        
    def _chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Split text into overlapping chunks for better retrieval"""
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence endings
                sentence_end = text.rfind('.', start, end)
                if sentence_end > start + chunk_size // 2:
                    end = sentence_end + 1
                else:
                    # Look for paragraph breaks
                    para_break = text.rfind('\n\n', start, end)
                    if para_break > start + chunk_size // 2:
                        end = para_break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - overlap
            
        return chunks
    
    def build_index(self, force_rebuild: bool = False):
        """Build or load the FAISS index from Atlan documentation"""
        index_file = os.path.join(self.index_path, 'faiss.index')
        docs_file = os.path.join(self.index_path, 'documents.pkl')
        metadata_file = os.path.join(self.index_path, 'metadata.pkl')
        
        # Check if index exists and is recent
        if not force_rebuild and all(os.path.exists(f) for f in [index_file, docs_file, metadata_file]):
            try:
                print("Loading existing FAISS index...")
                self.index = faiss.read_index(index_file)
                
                with open(docs_file, 'rb') as f:
                    self.documents = pickle.load(f)
                    
                with open(metadata_file, 'rb') as f:
                    self.metadata = pickle.load(f)
                    
                print(f"Loaded index with {len(self.documents)} documents")
                return
            except Exception as e:
                print(f"Error loading existing index: {e}")
                print("Rebuilding index...")
        
        print("Building new FAISS index from Atlan documentation...")
        
        all_chunks = []
        all_metadata = []
        
        for base_url, config in DOC_SOURCES.items():
            print(f"Processing {base_url}...")
            
            # Discover pages
            pages = discover_documentation_pages(base_url, max_pages=15)
            
            for page_url in pages:
                try:
                    print(f"  Extracting content from {page_url}")
                    content = extract_page_content(page_url, config["selectors"], config["exclude"])
                    
                    if content and len(content) > 100:
                        # Create chunks from the content
                        chunks = self._chunk_text(content)
                        
                        for i, chunk in enumerate(chunks):
                            if len(chunk) > 50:  # Only include meaningful chunks
                                all_chunks.append(chunk)
                                all_metadata.append({
                                    'url': page_url,
                                    'source': base_url,
                                    'chunk_id': i,
                                    'content_hash': hashlib.md5(chunk.encode()).hexdigest()
                                })
                                
                except Exception as e:
                    print(f"    Error processing {page_url}: {e}")
                    continue
        
        if not all_chunks:
            print("No content extracted! Using fallback content...")
            # Add some fallback content
            fallback_content = [
                "Atlan is a modern data catalog that helps organizations discover, understand, and trust their data.",
                "Use Atlan's API to programmatically access and manage your data catalog.",
                "Configure SSO in Atlan to enable single sign-on for your organization.",
                "Data lineage in Atlan shows how data flows through your systems.",
                "Connectors in Atlan help you integrate with various data sources."
            ]
            
            for i, content in enumerate(fallback_content):
                all_chunks.append(content)
                all_metadata.append({
                    'url': 'https://docs.atlan.com/',
                    'source': 'fallback',
                    'chunk_id': i,
                    'content_hash': hashlib.md5(content.encode()).hexdigest()
                })
        
        print(f"Created {len(all_chunks)} text chunks")
        
        # Generate embeddings
        print("Generating embeddings...")
        embeddings = self.model.encode(all_chunks, show_progress_bar=True)
        
        # Create FAISS index
        self.index = faiss.IndexFlatIP(self.dimension)  # Inner product for cosine similarity
        
        # Normalize embeddings for cosine similarity
        faiss.normalize_L2(embeddings)
        self.index.add(embeddings.astype('float32'))
        
        # Store documents and metadata
        self.documents = all_chunks
        self.metadata = all_metadata
        
        # Save index and data
        faiss.write_index(self.index, index_file)
        
        with open(docs_file, 'wb') as f:
            pickle.dump(self.documents, f)
            
        with open(metadata_file, 'wb') as f:
            pickle.dump(self.metadata, f)
            
        print(f"✅ Built and saved FAISS index with {len(all_chunks)} documents")
    
    def search(self, query: str, top_k: int = 5) -> List[Dict]:
        """Search for relevant documents using FAISS"""
        if self.index is None:
            self.build_index()
        
        # Generate query embedding
        query_embedding = self.model.encode([query])
        faiss.normalize_L2(query_embedding)
        
        # Search
        scores, indices = self.index.search(query_embedding.astype('float32'), top_k)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < len(self.documents):  # Valid index
                results.append({
                    'content': self.documents[idx],
                    'metadata': self.metadata[idx],
                    'score': float(score)
                })
        
        return results
    
    def get_context_for_query(self, query: str, max_context_length: int = 2000) -> Tuple[str, List[str]]:
        """Get formatted context and sources for a query"""
        results = self.search(query, top_k=8)
        
        if not results:
            return "No relevant information found in the knowledge base.", []
        
        # Filter results by score threshold
        relevant_results = [r for r in results if r['score'] > 0.3]
        
        if not relevant_results:
            relevant_results = results[:3]  # Take top 3 if none meet threshold
        
        # Build context
        context_parts = []
        sources = set()
        current_length = 0
        
        for result in relevant_results:
            content = result['content']
            url = result['metadata']['url']
            
            if current_length + len(content) > max_context_length:
                # Truncate content to fit
                remaining_space = max_context_length - current_length
                if remaining_space > 100:  # Only add if there's meaningful space
                    content = content[:remaining_space] + "..."
                else:
                    break
            
            context_parts.append(f"From {url}:\n{content}")
            sources.add(url)
            current_length += len(content)
        
        context = "\n\n---\n\n".join(context_parts)
        return context, list(sources)

# Global knowledge base instance
kb = AtlanKnowledgeBase()

def initialize_knowledge_base():
    """Initialize the knowledge base (call this on startup)"""
    try:
        kb.build_index()
        return True
    except Exception as e:
        print(f"Error initializing knowledge base: {e}")
        return False

def search_knowledge_base(query: str, top_k: int = 5):
    """Search the knowledge base for relevant information"""
    try:
        return kb.search(query, top_k)
    except Exception as e:
        print(f"Error searching knowledge base: {e}")
        return []

def get_rag_context(query: str):
    """Get RAG context for a query"""
    try:
        if kb.index is None:
            print("Knowledge base not initialized, building now...")
            kb.build_index()
        return kb.get_context_for_query(query)
    except Exception as e:
        print(f"Error getting RAG context: {e}")
        import traceback
        traceback.print_exc()
        return "Error retrieving context from knowledge base.", []