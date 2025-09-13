"""
AI classification and RAG functionality for the helpdesk system.
"""
import os
import re
import json
import requests
from typing import Dict, List, Tuple, Optional
from bs4 import BeautifulSoup
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Topic keywords mapping
TOPIC_KEYWORDS = {
    'How-to': ['how', 'tutorial', 'guide', 'steps', 'instructions', 'setup', 'configure'],
    'Product': ['feature', 'functionality', 'capability', 'product', 'tool', 'platform'],
    'Connector': ['connector', 'connection', 'integrate', 'source', 'database', 'snowflake', 'redshift', 'fivetran'],
    'Lineage': ['lineage', 'upstream', 'downstream', 'flow', 'dependency', 'trace', 'dag', 'airflow'],
    'API/SDK': ['api', 'sdk', 'endpoint', 'programmatic', 'rest', 'graphql', 'token', 'authentication'],
    'SSO': ['sso', 'saml', 'okta', 'auth', 'login', 'authentication', 'identity'],
    'Glossary': ['glossary', 'terms', 'business', 'definition', 'metadata', 'catalog'],
    'Best practices': ['best practice', 'recommendation', 'optimize', 'performance', 'governance'],
    'Sensitive data': ['sensitive', 'pii', 'gdpr', 'privacy', 'security', 'compliance', 'audit']
}

# Sentiment keywords
SENTIMENT_KEYWORDS = {
    'Frustrated': ['blocked', 'stuck', 'not working', 'failing', 'issue', 'problem'],
    'Angry': ['infuriating', 'terrible', 'awful', 'horrible', 'unacceptable', 'ridiculous'],
    'Curious': ['wondering', 'curious', 'interested', 'explore', 'learn', 'understand'],
    'Neutral': []  # Default fallback
}

# Priority keywords
PRIORITY_KEYWORDS = {
    'P0': ['down', 'blocker', 'production', 'critical', 'urgent', 'p0', 'emergency'],
    'P1': ['important', 'asap', 'soon', 'p1', 'high priority', 'deadline'],
    'P2': ['when possible', 'low priority', 'p2', 'nice to have']
}

# Knowledge base content (fallback when online RAG is disabled)
KB_CONTENT = {
    'How-to': {
        'content': 'To connect data sources to Atlan, navigate to the Sources section and select your connector type. Ensure you have the proper permissions configured.',
        'url': 'https://docs.atlan.com/connectors'
    },
    'Product': {
        'content': 'Atlan provides comprehensive data discovery, cataloging, and governance capabilities with automated lineage tracking.',
        'url': 'https://docs.atlan.com/overview'
    },
    'Best practices': {
        'content': 'Follow data governance best practices by implementing proper tagging, documentation, and access controls.',
        'url': 'https://docs.atlan.com/governance'
    },
    'API/SDK': {
        'content': 'Use the Atlan REST API to programmatically access metadata, lineage, and governance features.',
        'url': 'https://developer.atlan.com/api'
    },
    'SSO': {
        'content': 'Configure SSO integration using SAML or OIDC protocols for seamless authentication.',
        'url': 'https://docs.atlan.com/sso'
    }
}

class TicketClassifier:
    """Handles ticket classification using keyword-based approach."""
    
    def classify_ticket(self, text: str) -> Dict[str, str]:
        """
        Classify a ticket into topic, sentiment, and priority.
        
        Args:
            text: The ticket text to classify
            
        Returns:
            Dictionary with classification results
        """
        text_lower = text.lower()
        
        # Classify topic (multi-label possible, return most relevant)
        topic_scores = {}
        for topic, keywords in TOPIC_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                topic_scores[topic] = score
        
        topic = max(topic_scores, key=topic_scores.get) if topic_scores else 'Product'
        
        # Classify sentiment
        sentiment_scores = {}
        for sentiment, keywords in SENTIMENT_KEYWORDS.items():
            if sentiment == 'Neutral':
                continue
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                sentiment_scores[sentiment] = score
        
        sentiment = max(sentiment_scores, key=sentiment_scores.get) if sentiment_scores else 'Neutral'
        
        # Classify priority
        priority_scores = {}
        for priority, keywords in PRIORITY_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                priority_scores[priority] = score
        
        priority = max(priority_scores, key=priority_scores.get) if priority_scores else 'P2'
        
        return {
            'topics': [topic],  # Return as list for consistency with API contract
            'sentiment': sentiment,
            'priority': priority
        }

class RAGSystem:
    """Handles retrieval-augmented generation for answering tickets."""
    
    def __init__(self):
        self.use_online_rag = os.getenv('USE_ONLINE_RAG', 'false').lower() == 'true'
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        self.kb_documents = []
        self.kb_urls = []
        self._initialize_kb()
    
    def _initialize_kb(self):
        """Initialize knowledge base with seed content."""
        if self.use_online_rag:
            self._fetch_online_content()
        else:
            # Use pre-seeded content
            for topic, data in KB_CONTENT.items():
                self.kb_documents.append(data['content'])
                self.kb_urls.append(data['url'])
        
        if self.kb_documents:
            self.vectorizer.fit(self.kb_documents)
    
    def _fetch_online_content(self):
        """Fetch content from Atlan documentation (limited whitelist)."""
        urls = [
            'https://docs.atlan.com/',
            'https://developer.atlan.com/'
        ]
        
        for url in urls:
            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    # Extract text content
                    text = ' '.join([p.get_text() for p in soup.find_all('p')])
                    if len(text) > 100:  # Only add substantial content
                        self.kb_documents.append(text[:1000])  # Limit length
                        self.kb_urls.append(url)
            except Exception as e:
                print(f"Error fetching {url}: {e}")
    
    def rag_answer(self, query: str, topic: str) -> Dict[str, any]:
        """
        Generate RAG answer for a query.
        
        Args:
            query: The user query
            topic: The classified topic
            
        Returns:
            Dictionary with answer and citations
        """
        if not self.kb_documents:
            return {
                'message': 'Knowledge base not available. Please contact support.',
                'citations': []
            }
        
        # Check if topic requires RAG
        rag_topics = {'How-to', 'Product', 'Best practices', 'API/SDK', 'SSO'}
        
        if topic not in rag_topics:
            return {
                'message': f"This ticket has been classified as '{topic}' and routed to the appropriate team.",
                'citations': []
            }
        
        # Retrieve relevant documents
        query_vector = self.vectorizer.transform([query])
        doc_vectors = self.vectorizer.transform(self.kb_documents)
        
        # Calculate similarities
        similarities = cosine_similarity(query_vector, doc_vectors)[0]
        
        # Get top-k most similar documents
        top_k = min(3, len(similarities))
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        # Filter out low similarity scores
        relevant_docs = []
        relevant_urls = []
        for idx in top_indices:
            if similarities[idx] > 0.1:  # Minimum similarity threshold
                relevant_docs.append(self.kb_documents[idx])
                relevant_urls.append(self.kb_urls[idx])
        
        if not relevant_docs:
            # Fallback to topic-specific content
            if topic in KB_CONTENT:
                return {
                    'message': KB_CONTENT[topic]['content'],
                    'citations': [KB_CONTENT[topic]['url']]
                }
            else:
                return {
                    'message': 'I found some relevant information, but please check our documentation for detailed guidance.',
                    'citations': ['https://docs.atlan.com/', 'https://developer.atlan.com/']
                }
        
        # Compose answer
        answer = f"Based on the documentation, here's what I found: {relevant_docs[0][:200]}..."
        if len(relevant_docs) > 1:
            answer += f" Additionally, {relevant_docs[1][:100]}..."
        
        return {
            'message': answer,
            'citations': list(set(relevant_urls))  # Remove duplicates
        }

# Global instances
classifier = TicketClassifier()
rag_system = RAGSystem()

def classify_ticket(text: str) -> Dict[str, str]:
    """Classify a ticket text."""
    return classifier.classify_ticket(text)

def rag_answer(query: str, topic: str) -> Dict[str, any]:
    """Generate RAG answer for a query."""
    return rag_system.rag_answer(query, topic)