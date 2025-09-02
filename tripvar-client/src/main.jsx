import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Check if root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found! Make sure you have a div with id="root" in your HTML.');
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; background: #f8f9fa; min-height: 100vh;">
      <h1 style="color: #dc3545;">Application Error</h1>
      <p>Root element not found. Please check your HTML structure.</p>
      <p>Make sure you have a div with id="root" in your index.html file.</p>
    </div>
  `;
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to render React app:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: #f8f9fa; min-height: 100vh;">
        <h1 style="color: #dc3545;">React Render Error</h1>
        <p>Failed to render the React application.</p>
        <p>Error: ${error.message}</p>
        <p>Please check the console for more details.</p>
      </div>
    `;
  }
}
