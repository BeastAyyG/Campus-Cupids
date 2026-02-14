import React, { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0a10] text-[#e5e7eb] p-6 text-center">
                    <div className="bg-red-500/10 p-4 rounded-full mb-6 ring-1 ring-red-500/30">
                        <AlertTriangle size={48} className="text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Something went wrong.</h1>
                    <p className="text-sm text-[#9ca3af] max-w-md mb-8">
                        We're sorry, but the application encountered an unexpected error.
                        Please try refreshing the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-[#ec4899] hover:bg-[#db2777] text-white font-medium px-6 py-2 rounded-lg transition-all active:scale-95"
                    >
                        Refresh Page
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <details className="mt-8 text-left bg-black/50 p-4 rounded-lg border border-white/10 max-w-2xl w-full overflow-auto text-xs font-mono text-red-300">
                            <summary className="cursor-pointer mb-2 font-bold">Error Details</summary>
                            {this.state.error && this.state.error.toString()}
                            <br />
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
