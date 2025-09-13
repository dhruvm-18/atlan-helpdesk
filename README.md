# 🤖 AI-Powered Helpdesk Demo

A demonstration of an AI-powered helpdesk system built with **React.js frontend** and **Flask backend**. Features intelligent ticket classification, RAG-based responses, and modern UI components.

## 🚀 Features

### Frontend (React + TypeScript + Vite)
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Smooth Animations**: Framer Motion for delightful micro-interactions
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Theme**: Persistent theme switching
- **Real-time Charts**: Interactive data visualization with Recharts
- **Advanced Filtering**: Multi-dimensional ticket filtering and search
- **Accessibility**: Full keyboard navigation and screen reader support

### Backend (Flask + Python)
- **AI Classification**: Intelligent topic, sentiment, and priority detection
- **RAG System**: Retrieval-Augmented Generation for knowledge-based responses
- **Modular Architecture**: Clean separation of concerns with blueprints
- **Type Safety**: Pydantic models for request/response validation
- **CORS Support**: Configured for cross-origin requests

### AI Capabilities
- **Topic Classification**: Automatically categorizes tickets into 9+ topics
- **Sentiment Analysis**: Detects customer emotion (Frustrated, Curious, Angry, Neutral)
- **Priority Assignment**: Assigns P0/P1/P2 based on urgency indicators
- **Smart Routing**: RAG responses for knowledge topics, team routing for others
- **Citation Tracking**: Always provides source URLs for RAG answers

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Git**

## 🛠️ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ai-helpdesk-demo.git
cd ai-helpdesk-demo
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy environment file (optional)
cp .env.example .env

# Start the Flask server
python app.py
```

The backend will start on `http://localhost:5001`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies (use --legacy-peer-deps if you encounter conflicts)
npm install --legacy-peer-deps

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`



### 4. Open Your Browser
Navigate to `http://localhost:5173` to see the application in action!

## 📊 Sample Data

The application comes with 16 pre-loaded sample tickets covering various scenarios:
- Connector issues (Snowflake, Tableau, etc.)
- Lineage problems
- API/SDK questions
- SSO configuration
- Data governance queries
- And more...

## 🎯 Usage Guide

### Dashboard Tab
1. **View Tickets**: Browse all classified tickets in an interactive table
2. **Filter & Search**: Use the comprehensive filtering system
3. **Visual Analytics**: Explore topic distribution and sentiment charts
4. **Ticket Details**: Click the eye icon to view full ticket details

### Agent Tab
1. **Enter Ticket**: Paste or type a customer support request
2. **Select Channel**: Choose the communication channel
3. **Classify & Respond**: Click to process through AI pipeline
4. **View Results**: See both internal analysis and final response
5. **Browse History**: Access recent queries for quick reference

## 🔧 Configuration

### Backend Configuration (.env)
```bash
FLASK_PORT=5001                    # Backend server port
CORS_ORIGIN=http://localhost:5173  # Frontend URL for CORS
USE_ONLINE_RAG=false              # Enable online documentation scraping
GEMINI_API_KEY=your_key_here      # Optional: For enhanced AI features
```

### Adding Knowledge Base Content
To expand the RAG system:

1. **Online Mode**: Set `USE_ONLINE_RAG=true` to fetch from Atlan docs
2. **Offline Mode**: Edit `backend/core/ai.py` and update `KB_CONTENT` dictionary
3. **Custom Sources**: Modify the `DOC_SOURCES` list in `ai.py`

## 🏗️ Architecture

### Frontend Structure
```
frontend/src/
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── Dashboard.tsx    # Main dashboard view
│   ├── AgentPanel.tsx   # AI agent interface
│   ├── TicketTable.tsx  # Ticket display component
│   ├── Charts.tsx       # Data visualization
│   └── ...
├── lib/
│   ├── api.ts          # API client with React Query
│   └── utils.ts        # Utility functions
├── store/
│   └── ui.ts           # Zustand state management
└── App.tsx             # Main application component
```

### Backend Structure
```
backend/
├── core/
│   └── ai.py           # AI classification and RAG logic
├── routes/
│   ├── tickets.py      # Ticket-related endpoints
│   └── agent.py        # AI agent endpoints
├── app.py              # Flask application entry point
└── requirements.txt    # Python dependencies
```

## 🔌 API Endpoints

### GET /api/tickets
Returns all tickets with classifications
```json
[
  {
    "id": "TICKET-245",
    "channel": "email",
    "createdAt": "2024-01-15T09:30:00Z",
    "text": "Ticket description...",
    "classification": {
      "topics": ["Connector"],
      "sentiment": "Frustrated",
      "priority": "P1"
    }
  }
]
```

### POST /api/classify
Classifies a single ticket
```json
{
  "text": "How do I connect Snowflake?"
}
```

### POST /api/agent/respond
Full AI agent pipeline
```json
{
  "text": "How do I connect Snowflake?",
  "channel": "email"
}
```

Response:
```json
{
  "analysis": {
    "topics": ["Connector"],
    "sentiment": "Curious",
    "priority": "P2"
  },
  "final": {
    "type": "rag",
    "message": "To connect Snowflake...",
    "citations": ["https://docs.atlan.com/connectors"]
  }
}
```

## 🎨 Customization

### Themes
The application supports light/dark themes with CSS variables. Customize colors in `frontend/src/index.css`.

### Animation Settings
Modify animation preferences in individual components or globally disable with the `prefers-reduced-motion` media query.

### Classification Logic
Update classification rules in `backend/core/ai.py`:
- `TOPIC_KEYWORDS`: Add new topics or keywords
- `SENTIMENT_KEYWORDS`: Modify sentiment detection
- `PRIORITY_KEYWORDS`: Adjust priority assignment

## 🧪 Testing

### Frontend
```bash
cd frontend
npm run lint    # ESLint checking
npm run build   # Production build test
```

### Backend
```bash
cd backend
python -m pytest tests/  # Run unit tests (if implemented)
```

## 🚀 Building for Production

### Frontend
```bash
cd frontend
npm run build
# The built files will be in the 'dist' folder
```

### Backend
```bash
cd backend
# For production, use gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Framer Motion** for smooth animations
- **React Query** for excellent data fetching
- **Recharts** for data visualization

## 📞 Support

For questions or issues:
1. Check the existing GitHub issues
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs