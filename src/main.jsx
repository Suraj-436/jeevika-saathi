import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '60px auto', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #fee2e2', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#dc2626', marginBottom: '12px' }}>Application Render Notice</h2>
          <p style={{ color: '#475569', fontSize: '14px', marginBottom: '16px' }}>
            {this.state.error?.message || "An unexpected issue occurred while rendering the page."}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '8px 16px', backgroundColor: '#0e2a47', color: '#ffffff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
