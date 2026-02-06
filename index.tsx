// 1. Immediate loader removal
const loader = document.getElementById('initial-loader');
if (loader) loader.remove();

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Mount failed:", err);
    document.body.innerHTML += `<div style="color:red;padding:20px;font-family:monospace;">Render Error: ${err.message}</div>`;
  }
}