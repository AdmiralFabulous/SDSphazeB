export default function OfflinePage() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.heading}>You're Offline</h1>
        <p style={styles.description}>
          It looks like you've lost your internet connection. Some features may not be available right now.
        </p>

        <div style={styles.features}>
          <h2 style={styles.subheading}>What you can still do:</h2>
          <ul style={styles.list}>
            <li>View previously cached pages and data</li>
            <li>Start measurement sessions (saved when you're back online)</li>
            <li>Access your offline history</li>
          </ul>
        </div>

        <div style={styles.actions}>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </button>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>

        <p style={styles.footer}>
          We'll automatically sync your data when your connection is restored.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as const,
  },
  heading: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 16px 0',
    color: '#1a1a1a',
  },
  description: {
    fontSize: '16px',
    color: '#666',
    margin: '0 0 32px 0',
    lineHeight: '1.6',
  },
  features: {
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '32px',
    textAlign: 'left' as const,
  },
  subheading: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 12px 0',
    color: '#1a1a1a',
  },
  list: {
    margin: '0',
    paddingLeft: '20px',
    color: '#666',
    lineHeight: '1.8',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexDirection: 'column' as const,
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  primaryButton: {
    backgroundColor: '#000',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#e0e0e0',
    color: '#1a1a1a',
  },
  footer: {
    fontSize: '14px',
    color: '#999',
    margin: '0',
  },
};
