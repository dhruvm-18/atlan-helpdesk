"""
AI agent-related API routes with FAISS knowledge base integration.
"""
from flask import Blueprint, jsonify, request
from pydantic import BaseModel, ValidationError
from typing import List, Optional
from utils import classify_ticket, generate_response
from knowledge_base import search_knowledge_base
import json
import os
from datetime import datetime

agent_bp = Blueprint('agent', __name__)

class AgentRequest(BaseModel):
    text: str
    channel: Optional[str] = 'email'

class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None

def save_ticket_to_json(text: str, channel: str, classification: dict):
    """Save agent query as a ticket to sample_tickets.json"""
    try:
        # Load existing tickets
        tickets_file = 'sample_tickets.json'
        if os.path.exists(tickets_file):
            with open(tickets_file, 'r', encoding='utf-8') as f:
                tickets = json.load(f)
        else:
            tickets = []
        
        # Generate new ticket ID
        existing_ids = [int(ticket['id'].split('-')[1]) for ticket in tickets if ticket['id'].startswith('TICKET-')]
        next_id = max(existing_ids) + 1 if existing_ids else 1
        
        # Create new ticket
        new_ticket = {
            "id": f"TICKET-{next_id}",
            "channel": channel,
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "subject": f"Agent Query: {classification.get('topic', 'General')} - {classification.get('priority', 'P2 (Low)')}",
            "body": text,
            "classification": classification  # Add classification data
        }
        
        # Add to beginning of list (most recent first)
        tickets.insert(0, new_ticket)
        
        # Save back to file
        with open(tickets_file, 'w', encoding='utf-8') as f:
            json.dump(tickets, f, indent=2, ensure_ascii=False)
        
        print(f"Saved new ticket: {new_ticket['id']}")
        return new_ticket['id']
        
    except Exception as e:
        print(f"Error saving ticket to JSON: {e}")
        return None

@agent_bp.route('/api/agent/respond', methods=['POST'])
def agent_respond():
    """
    Process a ticket through the AI agent pipeline.
    Returns both analysis and final response.
    """
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        # Validate input
        try:
            agent_request = AgentRequest(**data)
        except ValidationError as e:
            return jsonify({'error': f'Invalid input: {e}'}), 400
        
        text = agent_request.text
        
        # Step 1: Classify the ticket
        print(f"Classifying ticket: {text[:100]}...")
        classification = classify_ticket(text)
        print(f"Classification result: {classification}")
        
        # Step 2: Save ticket to JSON file
        ticket_id = save_ticket_to_json(text, agent_request.channel, classification)
        print(f"Saved ticket with ID: {ticket_id}")
        
        # Step 3: Determine response type and generate appropriate response
        RAG_TOPICS = ["How-to", "Product", "Best practices", "API/SDK", "SSO"]
        topic = classification.get('topic', 'Other')
        
        if topic in RAG_TOPICS:
            # Generate RAG response for eligible topics
            print(f"Generating RAG response for topic: {topic}")
            response_data = generate_response(text, topic)
            print(f"Response data keys: {response_data.keys() if response_data else 'None'}")
            
            # Ensure we have valid response data
            if not response_data or 'response' not in response_data:
                print("Warning: Invalid response_data, using fallback")
                response_data = {
                    'response': 'I apologize, but I encountered an issue generating a response. Please try again or contact support.',
                    'sources': []
                }
            
            has_sources = response_data.get('sources') and len(response_data.get('sources', [])) > 0
            response_type = 'rag' if has_sources else 'routed'
            
            result = {
                'analysis': classification,
                'response': response_data['response'],
                'sources': response_data.get('sources', []),
                'type': response_type,
                'ticket_id': ticket_id
            }
        else:
            # For routed topics, provide a simple routing message
            print(f"Routing ticket for topic: {topic}")
            priority = classification.get('priority', 'P2 (Low)')
            
            # Create appropriate routing message based on topic and priority
            if priority.startswith('P0'):
                urgency_msg = "This is a high-priority issue and will be escalated immediately."
            elif priority.startswith('P1'):
                urgency_msg = "This will be prioritized and handled promptly."
            else:
                urgency_msg = "This will be handled by our team in the order received."
            
            routing_messages = {
                'Connector': f"Your connector-related query has been routed to our Data Integration team. {urgency_msg} You can expect a response within 24-48 hours with specific guidance on your connector setup.",
                'Lineage': f"Your data lineage question has been forwarded to our Data Governance specialists. {urgency_msg} They will provide detailed insights about your lineage configuration.",
                'Glossary': f"Your business glossary inquiry has been assigned to our Metadata Management team. {urgency_msg} They will assist you with glossary setup and best practices.",
                'Sensitive data': f"Your data privacy and security question has been escalated to our Data Security team. {urgency_msg} They will ensure your sensitive data requirements are properly addressed."
            }
            
            default_message = f"Your {topic.lower()} query has been routed to the appropriate specialist team. {urgency_msg} Thank you for your patience."
            
            result = {
                'analysis': classification,
                'response': routing_messages.get(topic, default_message),
                'sources': [],
                'type': 'routed',
                'ticket_id': ticket_id
            }
        
        print(f"Final response structure: {list(result.keys())}")
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in agent_respond: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/api/agent/chat', methods=['POST'])
def agent_chat():
    """
    Chat endpoint for conversational AI interactions.
    """
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        # Validate input
        try:
            chat_request = ChatMessage(**data)
        except ValidationError as e:
            return jsonify({'error': f'Invalid input: {e}'}), 400
        
        message = chat_request.message
        
        # Classify the message to understand intent
        classification = classify_ticket(message)
        topic = classification.get('topic', 'Other')
        
        # Save chat message as ticket
        ticket_id = save_ticket_to_json(message, 'live_chat', classification)
        
        # Use same routing logic as agent_respond
        RAG_TOPICS = ["How-to", "Product", "Best practices", "API/SDK", "SSO"]
        
        if topic in RAG_TOPICS:
            # Generate RAG response for eligible topics
            response_data = generate_response(message, topic)
            kb_results = search_knowledge_base(message, top_k=3)
            
            return jsonify({
                'response': response_data['response'],
                'sources': response_data.get('sources', []),
                'classification': {
                    'topic': topic,
                    'sentiment': classification.get('sentiment', 'Neutral'),
                    'priority': classification.get('priority', 'P2 (Low)')
                },
                'knowledge_base_results': len(kb_results),
                'conversation_id': chat_request.conversation_id or 'new',
                'ticket_id': ticket_id,
                'type': 'rag'
            })
        else:
            # For routed topics, provide routing message
            priority = classification.get('priority', 'P2 (Low)')
            
            if priority.startswith('P0'):
                urgency_msg = "This is a high-priority issue and will be escalated immediately."
            elif priority.startswith('P1'):
                urgency_msg = "This will be prioritized and handled promptly."
            else:
                urgency_msg = "This will be handled by our team in the order received."
            
            routing_messages = {
                'Connector': f"Your connector-related query has been routed to our Data Integration team. {urgency_msg}",
                'Lineage': f"Your data lineage question has been forwarded to our Data Governance specialists. {urgency_msg}",
                'Glossary': f"Your business glossary inquiry has been assigned to our Metadata Management team. {urgency_msg}",
                'Sensitive data': f"Your data privacy question has been escalated to our Data Security team. {urgency_msg}"
            }
            
            default_message = f"Your {topic.lower()} query has been routed to the appropriate team. {urgency_msg}"
            
            return jsonify({
                'response': routing_messages.get(topic, default_message),
                'sources': [],
                'classification': {
                    'topic': topic,
                    'sentiment': classification.get('sentiment', 'Neutral'),
                    'priority': classification.get('priority', 'P2 (Low)')
                },
                'knowledge_base_results': 0,
                'conversation_id': chat_request.conversation_id or 'new',
                'ticket_id': ticket_id,
                'type': 'routed'
            })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/api/agent/search', methods=['POST'])
def search_knowledge():
    """
    Search the knowledge base directly.
    """
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'error': 'Query is required'}), 400
        
        query = data['query']
        top_k = data.get('top_k', 5)
        
        results = search_knowledge_base(query, top_k)
        
        return jsonify({
            'query': query,
            'results': results,
            'total_results': len(results)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500