"""
Flask application for AI Helpdesk with FAISS Knowledge Base.
"""
import os
import threading
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from routes.tickets import tickets_bp
from routes.agent import agent_bp

# Load environment variables
load_dotenv()

def initialize_knowledge_base_async():
    """Initialize knowledge base in background thread"""
    try:
        from knowledge_base import initialize_knowledge_base
        print("🔄 Initializing FAISS knowledge base...")
        success = initialize_knowledge_base()
        if success:
            print("✅ Knowledge base initialized successfully!")
        else:
            print("❌ Failed to initialize knowledge base")
    except Exception as e:
        print(f"❌ Error initializing knowledge base: {e}")

def create_app():
    """Create and configure Flask application."""
    app = Flask(__name__)
    
    # Configure CORS
    cors_origin = os.getenv('CORS_ORIGIN', 'http://localhost:5173')
    CORS(app, origins=[cors_origin])
    
    # Initialize knowledge base in background
    kb_thread = threading.Thread(target=initialize_knowledge_base_async, daemon=True)
    kb_thread.start()
    
    # Register blueprints
    app.register_blueprint(tickets_bp)
    app.register_blueprint(agent_bp)
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'ok', 'message': 'AI Helpdesk API is running'})
    
    @app.route('/api/kb/status', methods=['GET'])
    def kb_status():
        """Check knowledge base status"""
        try:
            from knowledge_base import kb
            if kb.index is not None:
                return jsonify({
                    'status': 'ready',
                    'documents': len(kb.documents),
                    'message': 'Knowledge base is ready'
                })
            else:
                return jsonify({
                    'status': 'initializing',
                    'message': 'Knowledge base is still initializing'
                })
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'Knowledge base error: {str(e)}'
            })
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', os.getenv('FLASK_PORT', 5001)))
    debug = os.getenv('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug) 