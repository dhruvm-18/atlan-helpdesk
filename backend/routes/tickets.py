"""
Ticket-related API routes.
"""
import json
import os
import uuid
from datetime import datetime
from flask import Blueprint, jsonify, request
from pydantic import BaseModel, ValidationError
from typing import List, Optional
from utils import classify_ticket

tickets_bp = Blueprint('tickets', __name__)

class TicketModel(BaseModel):
    id: str
    channel: str = 'email'
    createdAt: str
    text: str
    classification: Optional[dict] = None

def load_sample_tickets():
    """Load and process sample tickets."""
    try:
        # Try multiple possible paths for the tickets file
        possible_paths = [
            'sample_tickets.json',  # Current directory
            '../sample_tickets.json',  # Parent directory
            os.path.join(os.path.dirname(__file__), '../../sample_tickets.json'),  # Relative to this file
            os.path.join(os.getcwd(), 'sample_tickets.json'),  # Current working directory
        ]
        
        tickets_path = None
        for path in possible_paths:
            if os.path.exists(path):
                tickets_path = path
                break
        
        if not tickets_path:
            print(f"Could not find sample_tickets.json in any of these paths: {possible_paths}")
            print(f"Current working directory: {os.getcwd()}")
            print(f"This file location: {os.path.dirname(__file__)}")
            return []
        
        print(f"Loading tickets from: {tickets_path}")
        
        with open(tickets_path, 'r', encoding='utf-8') as f:
            raw_tickets = json.load(f)
        
        print(f"Loaded {len(raw_tickets)} raw tickets")
        
        processed_tickets = []
        for ticket in raw_tickets:
            # Convert to expected format, handling both old and new structures
            if 'subject' in ticket and 'body' in ticket:
                # Old format with subject and body
                text = f"{ticket.get('subject', '')} - {ticket.get('body', '')}"
            elif 'body' in ticket:
                # New format where body is the main text (from agent)
                text = ticket.get('body', '')
            else:
                # Fallback
                text = ticket.get('text', '')
            
            processed_ticket = {
                'id': ticket.get('id', str(uuid.uuid4())),
                'channel': ticket.get('channel', 'email'),
                'createdAt': ticket.get('createdAt', datetime.now().isoformat()),
                'text': text,
                'classification': ticket.get('classification', None)  # Use existing classification if available
            }
            processed_tickets.append(processed_ticket)
        
        print(f"Processed {len(processed_tickets)} tickets")
        return processed_tickets
    except Exception as e:
        print(f"Error loading tickets: {e}")
        import traceback
        traceback.print_exc()
        return []

@tickets_bp.route('/api/tickets', methods=['GET'])
def get_tickets():
    """Get all tickets with classifications."""
    try:
        tickets = load_sample_tickets()
        print(f"Loaded {len(tickets)} tickets for API response")
        
        # Classify each ticket if not already classified
        classified_count = 0
        for ticket in tickets:
            if not ticket.get('classification'):
                classification = classify_ticket(ticket['text'])
                # Convert single topic to topics array for backward compatibility
                if 'topic' in classification and 'topics' not in classification:
                    classification['topics'] = [classification['topic']]
                ticket['classification'] = classification
                classified_count += 1
        
        print(f"Classified {classified_count} tickets on-the-fly")
        print(f"Returning {len(tickets)} tickets to frontend")
        
        return jsonify(tickets)
    except Exception as e:
        print(f"Error in get_tickets: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@tickets_bp.route('/api/tickets/test', methods=['GET'])
def test_tickets():
    """Test endpoint to check if tickets are loading."""
    try:
        tickets = load_sample_tickets()
        return jsonify({
            'status': 'success',
            'ticket_count': len(tickets),
            'sample_ticket_ids': [t['id'] for t in tickets[:5]],
            'working_directory': os.getcwd(),
            'file_exists': os.path.exists('sample_tickets.json')
        })
    except Exception as e:
        return jsonify({'error': str(e), 'working_directory': os.getcwd()}), 500

@tickets_bp.route('/api/classify', methods=['POST'])
def classify():
    """Classify a single ticket text."""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text']
        classification = classify_ticket(text)
        
        return jsonify({'classification': classification})
    except Exception as e:
        return jsonify({'error': str(e)}), 500