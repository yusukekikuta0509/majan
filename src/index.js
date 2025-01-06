import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Tailwind を取り込んだ index.css を読み込む
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
