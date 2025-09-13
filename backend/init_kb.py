#!/usr/bin/env python3
"""
Initialize the FAISS knowledge base
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from knowledge_base import initialize_knowledge_base

if __name__ == "__main__":
    print("🚀 Initializing Atlan Knowledge Base...")
    print("=" * 50)
    
    success = initialize_knowledge_base()
    
    if success:
        print("✅ Knowledge base initialized successfully!")
        print("The FAISS index is ready for use.")
    else:
        print("❌ Failed to initialize knowledge base")
        print("Check the logs above for error details.")
    
    print("=" * 50)