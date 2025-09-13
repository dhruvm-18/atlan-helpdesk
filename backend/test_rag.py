#!/usr/bin/env python3
"""
Test script for the enhanced RAG system
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils import scrape_relevant_content, generate_response, classify_ticket

def test_content_scraping():
    """Test the enhanced content scraping functionality"""
    print("🔍 Testing content scraping...")
    
    test_queries = [
        "API authentication",
        "SSO setup",
        "data lineage",
        "connector configuration",
        "glossary terms"
    ]
    
    for query in test_queries:
        print(f"\n--- Testing query: '{query}' ---")
        context, sources = scrape_relevant_content(query, max_snippets=2)
        print(f"Sources found: {len(sources)}")
        print(f"Context length: {len(context)} characters")
        print(f"Sources: {sources}")
        if context:
            print(f"Sample content: {context[:200]}...")
        else:
            print("❌ No content retrieved")
        print("-" * 50)

def test_full_rag_pipeline():
    """Test the complete RAG pipeline"""
    print("\n🤖 Testing full RAG pipeline...")
    
    test_tickets = [
        "How do I set up SSO with SAML in Atlan?",
        "I need help configuring a new data connector",
        "How can I view data lineage for my tables?",
        "What's the API endpoint for creating glossary terms?",
        "My data sync is failing, please help"
    ]
    
    for ticket in test_tickets:
        print(f"\n--- Testing ticket: '{ticket}' ---")
        
        # First classify the ticket
        classification = classify_ticket(ticket)
        print(f"Classification: {classification}")
        
        # Then generate response
        response = generate_response(ticket, classification.get('topic', 'Other'))
        print(f"Response length: {len(response.get('response', ''))} characters")
        print(f"Sources: {len(response.get('sources', []))} URLs")
        print(f"Sample response: {response.get('response', '')[:300]}...")
        print("-" * 50)

if __name__ == "__main__":
    print("🚀 Starting RAG System Tests")
    print("=" * 60)
    
    # Test content scraping
    test_content_scraping()
    
    # Test full pipeline
    test_full_rag_pipeline()
    
    print("\n✅ RAG system testing completed!")