import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  message: string
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = {
      hasError: false,
      message: '',
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Unknown error',
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('UI render crash:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-surface-0 px-6">
          <div className="max-w-xl w-full rounded-xl border border-red-200 bg-red-50 p-6 text-left">
            <h1 className="text-2xl font-bold text-red-700">Something went wrong</h1>
            <p className="mt-2 text-sm text-red-700/90">
              A render error was caught and prevented a blank screen.
            </p>
            <p className="mt-4 rounded-md bg-white p-3 text-xs font-mono text-red-700 break-words">
              {this.state.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary