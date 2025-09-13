"""
Flask application for AI Helpdesk with FAISS Knowledge Base.
"""
import os
import threading
from flask import Flask, jsonify, send_from_directory, send_file
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
    # Set static folder for production builds
    static_folder = 'static' if os.path.exists('static') else None
    app = Flask(__name__, static_folder=static_folder)
    
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
    
    # Serve frontend static files in production
    @app.route('/')
    def serve_frontend():
        """Serve the frontend index.html"""
        if app.static_folder and os.path.exists(os.path.join(app.static_folder, 'index.html')):
            return send_file(os.path.join(app.static_folder, 'index.html'))
        return jsonify({'message': 'AI Helpdesk API - Frontend not built'})
    
    @app.route('/<path:path>')
    def serve_static_files(path):
        """Serve static files or fallback to index.html for SPA routing"""
        if app.static_folder:
            file_path = os.path.join(app.static_folder, path)
            if os.path.exists(file_path):
                return send_from_directory(app.static_folder, path)
            # Fallback to index.html for SPA routing
            if os.path.exists(os.path.join(app.static_folder, 'index.html')):
                return send_file(os.path.join(app.static_folder, 'index.html'))
        return jsonify({'error': 'File not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', os.getenv('FLASK_PORT', 5001)))
    debug = os.getenv('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug) 