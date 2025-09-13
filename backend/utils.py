import os
import google.generativeai as genai
import requests
from bs4 import BeautifulSoup
import re
import json

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
MODEL_NAME = 'models/gemini-2.5-flash'

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Classification prompt
CLASSIFY_PROMPT = '''You are an expert helpdesk ticket classifier for Atlan. Given a customer support ticket, classify it with:
- Topic Tag: (choose one most relevant from How-to, Product, Connector, Lineage, API/SDK, SSO, Glossary, Best practices, Sensitive data)
- Sentiment: (Frustrated, Curious, Angry, Neutral)
- Priority: (P0 (High), P1 (Medium), P2 (Low))

Return a JSON object with keys: topic (string), sentiment (string), priority (string).

Ticket:
"""
{ticket}
"""

JSON:'''  # Gemini will output JSON

# Enhanced RAG prompt for better responses with markdown formatting
RAG_PROMPT = '''You are Atlan's expert AI helpdesk agent. You must provide helpful responses based on the documentation context provided.

CUSTOMER TICKET:
"""
{ticket}
"""

TOPIC: {topic}

DOCUMENTATION CONTEXT FROM ATLAN SOURCES:
{context}

INSTRUCTIONS:
- This ticket is classified as "{topic}"
- ONLY for topics: How-to, Product, Best practices, API/SDK, or SSO - provide a detailed answer using the context
- Use specific information from the documentation context provided
- Include step-by-step instructions, code examples, or configuration details when available
- Be precise, actionable, and professional
- Always cite the exact URLs you used from the context
- If context is insufficient, acknowledge this and direct to official documentation

FORMATTING REQUIREMENTS:
- Use proper markdown formatting for better readability
- Use **bold** for important terms and concepts
- Use ### for section headers
- Use numbered lists (1. 2. 3.) for step-by-step instructions
- Use bullet points (-) for feature lists or options
- Use `code blocks` for API endpoints, configuration values, or technical terms
- Use ```code blocks``` for multi-line code examples
- NO emojis or decorative symbols

For RAG-eligible topics, structure your response with markdown:
### Solution Overview
Brief explanation addressing the customer's question

### Step-by-Step Instructions
1. First step with **important details**
2. Second step with `technical terms`
3. Additional steps as needed

### Code Examples
```
Configuration or code examples here
```

### Important Notes
- Key considerations
- Best practices
- Warnings if applicable

Return ONLY a JSON object: {{"response": "your detailed customer response with markdown formatting", "sources": ["exact", "URLs", "from", "context"]}}
'''

# Enhanced web scraper for Atlan Docs and Developer Hub
DOC_SOURCES = {
    "https://docs.atlan.com/": {
        "selectors": ["article", ".content", ".markdown-body", "main", "[role='main']"],
        "exclude": ["nav", "header", "footer", ".sidebar", ".navigation"]
    },
    "https://developer.atlan.com/": {
        "selectors": ["article", ".content", ".markdown-body", "main", "[role='main']"],
        "exclude": ["nav", "header", "footer", ".sidebar", ".navigation"]
    }
}

def extract_page_content(url, selectors, exclude_selectors):
    """Extract meaningful content from a webpage"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        resp = requests.get(url, timeout=10, headers=headers)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        # Remove unwanted elements
        for exclude in exclude_selectors:
            for elem in soup.select(exclude):
                elem.decompose()
        
        # Try to find main content using selectors
        content_text = ""
        for selector in selectors:
            elements = soup.select(selector)
            if elements:
                for elem in elements:
                    # Extract text from paragraphs, headings, and lists
                    for tag in elem.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'div']):
                        text = tag.get_text(strip=True)
                        if text and len(text) > 20:  # Filter out short/empty text
                            content_text += text + "\n"
                break
        
        # Fallback: extract all meaningful text
        if not content_text:
            content_text = soup.get_text(separator='\n', strip=True)
        
        # Clean up the text
        lines = [line.strip() for line in content_text.split('\n') if line.strip()]
        # Remove duplicates while preserving order
        seen = set()
        unique_lines = []
        for line in lines:
            if line not in seen and len(line) > 10:
                seen.add(line)
                unique_lines.append(line)
        
        return '\n'.join(unique_lines[:50])  # Limit to first 50 meaningful lines
        
    except Exception as e:
        print(f"Content extraction error for {url}: {e}")
        return ""

def discover_documentation_pages(base_url, max_pages=10):
    """Discover relevant documentation pages from sitemap or navigation"""
    discovered_urls = [base_url]
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Try to get sitemap first
        sitemap_urls = [f"{base_url}sitemap.xml", f"{base_url}sitemap_index.xml"]
        for sitemap_url in sitemap_urls:
            try:
                resp = requests.get(sitemap_url, timeout=5, headers=headers)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, 'xml')
                    urls = [loc.text for loc in soup.find_all('loc')]
                    # Filter for documentation pages
                    doc_urls = [url for url in urls if any(keyword in url.lower() for keyword in 
                               ['guide', 'tutorial', 'api', 'docs', 'help', 'getting-started', 'setup', 'integration'])]
                    discovered_urls.extend(doc_urls[:max_pages])
                    return discovered_urls[:max_pages]
            except:
                continue
        
        # Fallback: scrape navigation links
        resp = requests.get(base_url, timeout=8, headers=headers)
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        # Look for navigation links
        nav_selectors = ['nav a', '.navigation a', '.menu a', '.sidebar a', '[role="navigation"] a']
        for selector in nav_selectors:
            links = soup.select(selector)
            for link in links:
                href = link.get('href')
                if href:
                    if href.startswith('/'):
                        full_url = base_url.rstrip('/') + href
                    elif href.startswith('http'):
                        full_url = href
                    else:
                        continue
                    
                    # Filter for relevant documentation pages
                    if any(keyword in full_url.lower() for keyword in 
                          ['guide', 'tutorial', 'api', 'docs', 'help', 'getting-started', 'setup', 'integration']):
                        discovered_urls.append(full_url)
                        
                    if len(discovered_urls) >= max_pages:
                        break
            if len(discovered_urls) >= max_pages:
                break
                
    except Exception as e:
        print(f"Page discovery error for {base_url}: {e}")
    
    return list(set(discovered_urls))[:max_pages]

def scrape_relevant_content(query, max_snippets=5):
    """Enhanced content scraping with better relevance matching"""
    all_content = []
    sources_used = []
    
    for base_url, config in DOC_SOURCES.items():
        print(f"Scraping content from {base_url}...")
        
        # Discover relevant pages
        pages = discover_documentation_pages(base_url, max_pages=8)
        
        for page_url in pages:
            try:
                content = extract_page_content(page_url, config["selectors"], config["exclude"])
                if content:
                    # Split content into chunks and find relevant ones
                    chunks = [chunk.strip() for chunk in content.split('\n') if chunk.strip()]
                    
                    for chunk in chunks:
                        # Better relevance scoring
                        relevance_score = 0
                        query_words = query.lower().split()
                        chunk_lower = chunk.lower()
                        
                        # Exact phrase match (highest score)
                        if query.lower() in chunk_lower:
                            relevance_score += 10
                        
                        # Individual word matches
                        for word in query_words:
                            if word in chunk_lower:
                                relevance_score += 2
                        
                        # Context keywords for different topics
                        context_keywords = {
                            'api': ['endpoint', 'request', 'response', 'authentication', 'token'],
                            'sso': ['single sign-on', 'authentication', 'login', 'identity', 'saml', 'oauth'],
                            'connector': ['connection', 'integrate', 'sync', 'data source'],
                            'lineage': ['data lineage', 'dependency', 'upstream', 'downstream'],
                            'glossary': ['term', 'definition', 'business glossary', 'metadata']
                        }
                        
                        for topic, keywords in context_keywords.items():
                            if topic in query.lower():
                                for keyword in keywords:
                                    if keyword in chunk_lower:
                                        relevance_score += 3
                        
                        if relevance_score > 2 and len(chunk) > 30:
                            all_content.append((relevance_score, page_url, chunk))
                            
            except Exception as e:
                print(f"Error processing {page_url}: {e}")
                continue
    
    # Sort by relevance score and take top results
    all_content.sort(key=lambda x: x[0], reverse=True)
    top_content = all_content[:max_snippets]
    
    if not top_content:
        # Fallback to basic content if no relevant content found
        return "No specific documentation found for this query. Please refer to the official Atlan documentation.", list(DOC_SOURCES.keys())
    
    # Format context
    context_parts = []
    for score, url, content in top_content:
        context_parts.append(f"From {url}:\n{content}")
        sources_used.append(url)
    
    context = "\n\n---\n\n".join(context_parts)
    sources_used = list(set(sources_used))
    
    print(f"Found {len(top_content)} relevant content pieces from {len(sources_used)} sources")
    return context, sources_used

def clean_response_text(text):
    """Clean AI response text by removing emojis while preserving markdown formatting"""
    if not text:
        return text
    
    # Remove emojis using regex
    emoji_pattern = re.compile("["
        u"\U0001F600-\U0001F64F"  # emoticons
        u"\U0001F300-\U0001F5FF"  # symbols & pictographs
        u"\U0001F680-\U0001F6FF"  # transport & map symbols
        u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
        u"\U00002500-\U00002BEF"  # chinese char
        u"\U00002702-\U000027B0"
        u"\U00002702-\U000027B0"
        u"\U000024C2-\U0001F251"
        u"\U0001f926-\U0001f937"
        u"\U00010000-\U0010ffff"
        u"\u2640-\u2642" 
        u"\u2600-\u2B55"
        u"\u200d"
        u"\u23cf"
        u"\u23e9"
        u"\u231a"
        u"\ufe0f"  # dingbats
        u"\u3030"
        "]+", flags=re.UNICODE)
    
    text = emoji_pattern.sub(r'', text)
    
    # Only clean up excessive whitespace, preserve markdown formatting
    text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)  # Max 2 consecutive line breaks
    text = re.sub(r'[ \t]+', ' ', text)  # Multiple spaces to single space
    
    # Remove extra spaces and trim
    text = text.strip()
    
    return text

def extract_json(text):
    """Extract JSON from text with multiple fallback strategies"""
    try:
        # Strategy 1: Look for JSON code blocks
        json_block_match = re.search(r'```json\s*(\{[\s\S]*?\})\s*```', text, re.IGNORECASE)
        if json_block_match:
            return json.loads(json_block_match.group(1))
        
        # Strategy 2: Look for JSON objects (greedy match for nested objects)
        json_match = re.search(r'\{(?:[^{}]|{[^{}]*})*\}', text)
        if json_match:
            json_str = json_match.group(0)
            return json.loads(json_str)
        
        # Strategy 3: Try to parse the entire text as JSON
        return json.loads(text.strip())
        
    except json.JSONDecodeError as e:
        print(f'JSON decode error: {e}')
        # Strategy 4: Try to fix common JSON issues
        try:
            # Fix common issues like trailing commas, unquoted keys, etc.
            fixed_text = text.strip()
            if fixed_text.startswith('```') and fixed_text.endswith('```'):
                fixed_text = fixed_text.strip('`').strip()
                if fixed_text.startswith('json'):
                    fixed_text = fixed_text[4:].strip()
            
            # Try to extract just the JSON part
            start = fixed_text.find('{')
            end = fixed_text.rfind('}') + 1
            if start != -1 and end > start:
                json_part = fixed_text[start:end]
                return json.loads(json_part)
                
        except Exception as e2:
            print(f'JSON fix attempt failed: {e2}')
    
    except Exception as e:
        print(f'JSON extraction error: {e}')
    
    return None

def classify_ticket(text):
    if not GEMINI_API_KEY:
        return {
            "topic": "How-to",
            "sentiment": "Curious",
            "priority": "P1 (Medium)"
        }
    prompt = CLASSIFY_PROMPT.format(ticket=text)
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        result = extract_json(response.text)
        if result and all(k in result for k in ("topic", "sentiment", "priority")):
            return result
    except Exception as e:
        print('Gemini classify error:', e)
    return {
        "topic": "How-to",
        "sentiment": "Curious",
        "priority": "P1 (Medium)"
    }

def generate_response(text, topics):
    """Generate AI response using RAG with FAISS knowledge base"""
    topic = topics[0] if isinstance(topics, list) and topics else topics if isinstance(topics, str) else "Other"
    
    print(f"Generating response for topic: {topic}")
    
    # Try to use FAISS knowledge base, fallback to basic scraping
    try:
        from knowledge_base import get_rag_context
        search_query = f"{topic} {text}"
        context, sources = get_rag_context(search_query)
        print(f"Retrieved context from FAISS: {len(context)} characters from {len(sources)} sources")
    except Exception as e:
        print(f"FAISS knowledge base error: {e}, falling back to basic scraping")
        try:
            # Fallback to basic scraping
            search_query = f"{topic} {text}"
            context, sources = scrape_relevant_content(search_query)
            print(f"Retrieved context from scraping: {len(context)} characters from {len(sources)} sources")
        except Exception as e2:
            print(f"Basic scraping also failed: {e2}, using minimal fallback")
            context = f"I understand you're asking about {topic}. While I don't have specific documentation available right now, I recommend checking the official Atlan documentation or contacting support for detailed assistance."
            sources = ["https://docs.atlan.com/", "https://developer.atlan.com/"]
    
    prompt = RAG_PROMPT.format(ticket=text, topic=topic, context=context)
    
    # Define RAG-eligible topics as per requirements
    RAG_TOPICS = ["How-to", "Product", "Best practices", "API/SDK", "SSO"]
    
    # Fallback responses when no API key
    if not GEMINI_API_KEY:
        print("No Gemini API key - using fallback response")
        if topic in RAG_TOPICS:
            return {
                "response": f"Based on the Atlan documentation, here's guidance for your {topic} question:\n\n{context[:500]}...\n\nFor complete details, please refer to the official documentation.",
                "sources": sources
            }
        else:
            return {
                "response": f"This ticket has been classified as a '{topic}' issue and routed to the appropriate team.",
                "sources": []
            }
    
    try:
        print("Calling Gemini API for response generation...")
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        
        print(f"Gemini response received: {len(response.text)} characters")
        
        result = extract_json(response.text)
        if result and "response" in result:
            # Clean the response text
            result['response'] = clean_response_text(result['response'])
            
            # Ensure sources are included
            if "sources" not in result or not result["sources"]:
                result['sources'] = sources
            print(f"Successfully generated response with {len(result.get('sources', []))} sources")
            return result
        else:
            print("Failed to extract valid JSON from Gemini response")
            print(f"Raw response: {response.text[:200]}...")
            raise Exception('No valid JSON in Gemini response')
            
    except Exception as e:
        print(f'Gemini RAG error: {e}')
        
        # Enhanced fallback with actual context - only for RAG topics
        if topic in RAG_TOPICS:
            if context and len(context) > 100:
                # Use the scraped content for a better fallback
                fallback_response = f"Based on the available Atlan documentation for {topic}:\n\n{context[:800]}...\n\nFor the most up-to-date information, please check the official Atlan documentation."
                return {
                    "response": clean_response_text(fallback_response),
                    "sources": sources
                }
            else:
                fallback_response = f"I found limited information for your {topic} question. Please refer to the official Atlan documentation for detailed guidance, or contact our support team for personalized assistance."
                return {
                    "response": clean_response_text(fallback_response),
                    "sources": sources
                }
        else:
            fallback_response = f"This ticket has been classified as a '{topic}' issue and routed to the appropriate team."
            return {
                "response": clean_response_text(fallback_response),
                "sources": []
            } 