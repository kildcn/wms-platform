import React from 'react';
import ReactDOM from 'react-dom/client';
import WMSApplication from './components/WMSApplication';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WMSApplication />
  </React.StrictMode>
);
