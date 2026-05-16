// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: '#111118',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#F1F0F7',
            fontFamily: "'Outfit', sans-serif",
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
