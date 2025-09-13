import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';

const GlobalStyle = createGlobalStyle`
  body {
    background: #f4f7fa;
    font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
    margin: 0;
    color: #222;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a237e;
  margin-bottom: 32px;
  letter-spacing: -1px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
`;

const Tab = styled.button`
  background: ${({ active }) => (active ? '#1a237e' : '#fff')};
  color: ${({ active }) => (active ? '#fff' : '#1a237e')};
  border: 2px solid #1a237e;
  border-radius: 8px 8px 0 0;
  padding: 12px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: background 0.2s, color 0.2s;
  box-shadow: ${({ active }) => (active ? '0 4px 12px rgba(26,35,126,0.08)' : 'none')};
`;

function App() {
  const [tab, setTab] = useState('dashboard');
  return (
    <>
      <GlobalStyle />
      <Container>
        <Title>Atlan Dummy Helpdesk</Title>
        <Tabs>
          <Tab active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>Bulk Ticket Dashboard</Tab>
          <Tab active={tab === 'agent'} onClick={() => setTab('agent')}>Interactive AI Agent</Tab>
        </Tabs>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'agent' && <Chatbot />}
      </Container>
    </>
  );
}

export default App;
