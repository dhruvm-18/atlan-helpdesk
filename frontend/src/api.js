const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export async function fetchTickets() {
  const res = await fetch(`${API_BASE}/tickets`);
  return res.json();
}

export async function classifyTicket(text) {
  const res = await fetch(`${API_BASE}/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return res.json();
}

export async function getResponse(text, topics) {
  const res = await fetch(`${API_BASE}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, topics })
  });
  return res.json();
} 