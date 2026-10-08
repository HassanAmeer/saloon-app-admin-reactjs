import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Unhandled UI Exception caught by ErrorBoundary:', error, errorInfo);
    }

    handleReset = () => {
        try {
            localStorage.removeItem('salon_user');
        } catch {
            // ignore
        }
        window.location.href = '/';
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FFFBF9',
                    fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
                    padding: '24px'
                }}>
                    <div style={{
                        maxWidth: '480px',
                        width: '100%',
                        backgroundColor: '#ffffff',
                        borderRadius: '20px',
                        padding: '40px 32px',
                        textAlign: 'center',
                        boxShadow: '0 10px 40px rgba(248, 153, 99, 0.12)',
                        border: '1px solid #FFE5D6'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            margin: '0 auto 20px',
                            borderRadius: '16px',
                            backgroundColor: '#FFF2EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px'
                        }}>
                            ⚠️
                        </div>
                        <h2 style={{
                            margin: '0 0 10px',
                            fontSize: '22px',
                            fontWeight: '800',
                            color: '#1A1A1A'
                        }}>
                            Something Went Wrong
                        </h2>
                        <p style={{
                            margin: '0 0 24px',
                            fontSize: '14px',
                            color: '#666666',
                            lineHeight: '1.6'
                        }}>
                            A display error occurred while rendering the page. You can reload or reset your session to return to the login screen.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={this.handleReload}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    border: '1px solid #FFE5D6',
                                    backgroundColor: '#FFF2EB',
                                    color: '#E27E49',
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={this.handleReset}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #F89963 0%, #E27E49 100%)',
                                    color: '#ffffff',
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(248, 153, 99, 0.35)'
                                }}
                            >
                                Reset & Login
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
