# Architecture Overview

## System Architecture

```
┌─────────────────┐    HTTP/JSON    ┌─────────────────┐
│   React Frontend │ ◄──────────────► │  Flask Backend  │
│                 │                 │                 │
│  • Dashboard    │                 │  • AI Engine   │
│  • Agent Panel  │                 │  • RAG System  │
│  • Charts       │                 │  • API Routes  │
│  • Animations   │                 │  • Data Models │
└─────────────────┘                 └─────────────────┘
         │                                   │
         │                                   │
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│  Browser State  │                 │  Knowledge Base │
│                 │                 │                 │
│  • Zustand      │                 │  • Seed Content │
│  • React Query  │                 │  • TF-IDF Index │
│  • Local Storage│                 │  • Web Scraper  │
└─────────────────┘                 └─────────────────┘
```

## Data Flow

### 1. Ticket Classification Pipeline
```
User Input → Text Analysis → Topic Detection → Sentiment Analysis → Priority Assignment
```

### 2. RAG Response Pipeline
```
Query → Document Retrieval → Context Assembly → Answer Generation → Citation Linking
```

### 3. Frontend State Management
```
API Call → React Query Cache → Component State → UI Updates → User Interaction
```

## Key Components

### Frontend (React + TypeScript)
- **UI Framework**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand (UI) + React Query (Server)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Build Tool**: Vite

### Backend (Flask + Python)
- **Web Framework**: Flask with Blueprints
- **AI Engine**: Custom classification + RAG
- **Data Validation**: Pydantic
- **CORS**: Flask-CORS
- **Text Processing**: scikit-learn TF-IDF

### AI Classification Logic
```python
# Topic Classification
keywords_match → topic_scores → highest_score_topic

# Sentiment Analysis  
emotion_keywords → sentiment_scores → dominant_sentiment

# Priority Detection
urgency_keywords → priority_scores → final_priority
```

### RAG System Architecture
```
Query Input
    ↓
TF-IDF Vectorization
    ↓
Cosine Similarity Search
    ↓
Top-K Document Retrieval
    ↓
Context Assembly
    ↓
Answer Generation + Citations
```

## Security Considerations

- **CORS**: Configured for specific origins
- **Input Validation**: Pydantic models
- **Rate Limiting**: Ready for production implementation
- **Error Handling**: Graceful degradation
- **XSS Protection**: React's built-in escaping

## Performance Optimizations

- **Frontend**: Code splitting, lazy loading, memoization
- **Backend**: Efficient text processing, caching ready
- **Database**: Optimized for read-heavy workloads
- **Network**: Minimal API calls, efficient data structures

## Scalability Considerations

- **Horizontal Scaling**: Stateless backend design
- **Caching**: Redis-ready architecture
- **Database**: Easy migration to PostgreSQL/MongoDB
- **CDN**: Static asset optimization
- **Microservices**: Modular component design