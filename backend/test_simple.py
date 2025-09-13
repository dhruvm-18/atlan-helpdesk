#!/usr/bin/env python3
"""
Simple test for the agent response system
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils import classify_ticket, generate_response

def test_simple_flow():
    """Test the basic classification and response flow"""
    print("🧪 Testing simple agent flow...")
    print("=" * 50)
    
    test_text = "How do I set up SSO with SAML in Atlan?"
    
    try:
        # Test classification
        print(f"1. Testing classification for: '{test_text}'")
        classification = classify_ticket(test_text)
        print(f"   Classification result: {classification}")
        
        # Test response generation
        print(f"2. Testing response generation...")
        topic = classification.get('topic', 'Other')
        response = generate_response(test_text, topic)
        print(f"   Response keys: {list(response.keys()) if response else 'None'}")
        
        if response and 'response' in response:
            print(f"   Response length: {len(response['response'])} characters")
            print(f"   Sources: {len(response.get('sources', []))} URLs")
            print(f"   Sample response: {response['response'][:200]}...")
        else:
            print("   ❌ No valid response generated")
            
        print("✅ Test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_simple_flow()
    if success:
        print("\n🎉 All tests passed!")
    else:
        print("\n💥 Tests failed!")