import './index.css';
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { registerServiceWorker } from './serviceWorkerRegistration';
// Import directly to make the functions available in the window object
import './firebase/robustDatabaseFix';

// Get the root element
const rootElement = document.getElementById("root");

// Create a root
const root = createRoot(rootElement!);

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA support
registerServiceWorker();