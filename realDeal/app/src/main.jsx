import { Buffer } from 'buffer';
// Several @midnight-ntwrk packages reference `Buffer` as a global at
// runtime (e.g. when serialising bigints / hex). Browsers don't expose
// it, so we polyfill before any midnight-js code runs.
if (typeof globalThis.Buffer === 'undefined') globalThis.Buffer = Buffer;

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
