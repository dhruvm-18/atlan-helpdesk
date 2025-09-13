# 🤖 AI-Powered Helpdesk System

An intelligent customer support system that automatically classifies tickets, analyzes sentiment, assigns priorities, and generates contextual responses using AI and RAG (Retrieval-Augmented Generation) technology.

![Dashboard Overview](Dashboard.jpg)

## ✨ Features

### 🎯 Intelligent Ticket Classification
- **Topic Detection**: Automatically categorizes tickets into relevant topics (Connector, Lineage, API, SSO, etc.)
- **Sentiment Analysis**: Identifies customer emotions (Frustrated, Curious, Angry, Neutral)
- **Priority Assignment**: Assigns P0/P1/P2 priorities based on urgency indicators
- **Multi-channel Support**: Handles tickets from email, WhatsApp, voice, live chat, and other channels

### 🧠 AI-Powered Response Generation
- **RAG System**: Uses knowledge base to provide accurate, contextual responses
- **Smart Routing**: Routes complex queries to specialist teams when needed
- **Citation Tracking**: Always provides source references for knowledge-based answers
- **Response Personalization**: Adapts tone and content based on ticket context

![AI Response Generation](Response%20generated.jpg)

### 📊 Analytics & Insights
- **Real-time Dashboard**: Visual overview of ticket distribution and trends
- **Interactive Charts**: Topic distribution, sentiment analysis, and priority breakdowns
- **Advanced Filtering**: Multi-dimensional search and filtering capabilities
- **Performance Metrics**: Track response times and resolution rates

### 🎨 Modern User Interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Persistent theme switching with user preferences
- **Smooth Animations**: Delightful micro-interactions using Framer Motion
- **Accessibility**: Full keyboard navigation and screen reader support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ai-helpdesk-system.git
cd ai-helpdesk-system
```

### 2. Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Copy environment configuration (optional)
cp .env.example .env

# Start the Flask server
python app.py
```

The backend will be available at `http://localhost:5001`

### 3. Frontend Setup
```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Access the Application
Open your browser and navigate to `http://localhost:5173` to start using the AI helpdesk system!

## 📱 How to Use

### Dashboard View
The main dashboard provides a comprehensive overview of all support tickets with powerful filtering and analytics capabilities.

![Ticket Query Interface](Ticket%20Query.jpg)

**Key Features:**
- View all classified tickets in an interactive table
- Filter by topic, sentiment, priority, and channel
- Search through ticket content
- Analyze trends with visual charts
- Export data for reporting

### AI Agent Interface
The agent panel allows you to process new tickets and see the AI classification and response generation in real-time.

**Workflow:**
1. **Input Ticket**: Paste or type a customer support request
2. **Select Channel**: Choose the communication channel (email, chat, etc.)
3. **AI Processing**: Click to run the ticket through the AI pipeline
4. **View Results**: See classification analysis and generated response
5. **Review History**: Access previous queries and responses

### Specialist Team Routing
For complex queries that require human expertise, the system intelligently routes tickets to appropriate specialist teams.

![Specialist Team Routing](Routing%20Specialist%20Team.jpg)

**Routing Logic:**
- **Technical Issues**: Routed to engineering teams
- **Account Problems**: Directed to customer success
- **Billing Queries**: Sent to finance department
- **Product Questions**: Forwarded to product specialists

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
frontend/src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── Dashboard.tsx    # Main dashboard interface
│   ├── AgentPanel.tsx   # AI agent interaction panel
│   ├── TicketTable.tsx  # Ticket display and filtering
│   ├── Charts.tsx       # Data visualization components
│   └── ...
├── lib/
│   ├── api.ts          # API client with React Query
│   └── utils.ts        # Utility functions
├── store/
│   └── ui.ts           # State management with Zustand
└── App.tsx             # Main application component
```

### Backend (Flask + Python)
```
backend/
├── core/
│   └── ai.py           # AI classification and RAG logic
├── routes/
│   ├── tickets.py      # Ticket management endpoints
│   └── agent.py        # AI agent processing endpoints
├── knowledge_base/     # RAG knowledge base files
├── app.py              # Flask application entry point
└── requirements.txt    # Python dependencies
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```bash
# Server Configuration
FLASK_PORT=5001
CORS_ORIGIN=http://localhost:5173

# AI Features
USE_ONLINE_RAG=false
GEMINI_API_KEY=your_api_key_here  # Optional: For enhanced AI features

# Knowledge Base
KB_UPDATE_INTERVAL=3600  # Update interval in seconds
```

### Customization Options

#### Adding New Topics
Update the topic classification in `backend/core/ai.py`:
```python
TOPIC_KEYWORDS = {
    "Connector": ["connection", "integrate", "sync"],
    "Custom Topic": ["custom", "keywords", "here"],
    # Add your topics here
}
```

#### Modifying Response Templates
Customize AI response templates in the same file:
```python
RESPONSE_TEMPLATES = {
    "rag": "Based on our documentation: {response}\n\nSources: {citations}",
    "routing": "I've forwarded your query to our {team} team...",
    # Add custom templates
}
```

## 📊 API Reference

### GET /api/tickets
Retrieve all tickets with classifications
```json
{
  "tickets": [
    {
      "id": "TICKET-001",
      "channel": "email",
      "createdAt": "2024-01-15T09:30:00Z",
      "text": "How do I connect Snowflake to Atlan?",
      "classification": {
        "topic": "Connector",
        "sentiment": "Curious",
        "priority": "P2"
      }
    }
  ]
}
```

### POST /api/classify
Classify a single ticket
```json
{
  "text": "I'm having trouble with my Tableau connection",
  "channel": "email"
}
```

### POST /api/agent/respond
Full AI agent processing pipeline
```json
{
  "text": "How do I set up SSO with Okta?",
  "channel": "live_chat"
}
```

Response:
```json
{
  "analysis": {
    "topic": "SSO",
    "sentiment": "Curious",
    "priority": "P1"
  },
  "response": "To set up SSO with Okta...",
  "sources": ["https://docs.example.com/sso-setup"],
  "type": "rag"
}
```

## 🧪 Sample Data

The system comes with 16 pre-loaded sample tickets covering various scenarios:

- **Connector Issues**: Snowflake, Tableau, PostgreSQL connection problems
- **Data Lineage**: Lineage tracking and visualization queries
- **API/SDK**: Integration and development questions
- **SSO Configuration**: Single sign-on setup and troubleshooting
- **Data Governance**: Policy and compliance inquiries
- **Performance**: System performance and optimization
- **Billing**: Account and subscription questions

## 🛠️ Development

### Running Tests
```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
python -m pytest tests/
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# The built files will be in the 'dist' folder
```

### Code Quality
```bash
# Frontend linting
cd frontend
npm run lint

# Python code formatting
cd backend
black . && flake8 .
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Framer Motion** for smooth animations
- **React Query** for excellent data fetching
- **Recharts** for data visualization
- **Flask** for the robust backend framework

## 📞 Support

For questions, issues, or contributions:

1. Check existing [GitHub Issues](https://github.com/your-username/ai-helpdesk-system/issues)
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs
4. Provide system information and error logs

---

**Built with ❤️ for modern customer support teams**