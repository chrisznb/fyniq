import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  level?: 'page' | 'component' | 'critical'
}

/**
 * Error Boundary Component
 * Catches JavaScript errors in component tree and displays fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 3

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to localStorage for debugging (with size limit)
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        level: this.props.level || 'component',
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        }
      }

      const existingLogs = localStorage.getItem('fyniq_error_logs')
      const logs = existingLogs ? JSON.parse(existingLogs) : []
      logs.push(errorLog)
      
      // Keep only last 10 errors to prevent storage bloat
      if (logs.length > 10) {
        logs.splice(0, logs.length - 10)
      }
      
      localStorage.setItem('fyniq_error_logs', JSON.stringify(logs))
    } catch (logError) {
      console.error('Failed to log error to localStorage:', logError)
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }))
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI based on level
      const { level = 'component' } = this.props
      const canRetry = this.state.retryCount < this.maxRetries

      return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-red-800">
                {level === 'critical' ? 'Kritischer Fehler' : 
                 level === 'page' ? 'Seite konnte nicht geladen werden' : 
                 'Komponente konnte nicht geladen werden'}
              </h2>
            </div>
            
            <p className="text-red-700 mb-4">
              {level === 'critical' 
                ? 'Ein kritischer Fehler ist aufgetreten. Bitte laden Sie die Seite neu.' 
                : 'Ein unerwarteter Fehler ist aufgetreten. Wir entschuldigen uns für die Unannehmlichkeiten.'}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 p-3 bg-red-100 rounded border text-sm">
                <summary className="cursor-pointer font-medium text-red-800">
                  Fehlerdetails (nur Development)
                </summary>
                <pre className="mt-2 text-red-700 overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Erneut versuchen ({this.maxRetries - this.state.retryCount} übrig)
                </button>
              )}
              
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Zurücksetzen
              </button>

              {level === 'page' && (
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Zur Startseite
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Higher-Order Component for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

/**
 * Async Error Boundary for handling async operations
 */
export class AsyncErrorBoundary extends Component<
  ErrorBoundaryProps & { onAsyncError?: (error: Error) => void },
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps & { onAsyncError?: (error: Error) => void }) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    
    console.error('AsyncErrorBoundary caught an error:', error, errorInfo)
    
    if (this.props.onAsyncError) {
      this.props.onAsyncError(error)
    }
  }

  override componentDidMount() {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      const error = new Error(
        event.reason instanceof Error ? event.reason.message : String(event.reason)
      )
      
      this.setState({
        hasError: true,
        error,
        errorInfo: null
      })
      
      if (this.props.onAsyncError) {
        this.props.onAsyncError(error)
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600 mr-2" />
              <h2 className="text-lg font-semibold text-orange-800">
                Asynchroner Fehler
              </h2>
            </div>
            
            <p className="text-orange-700 mb-4">
              Ein Fehler ist bei einer asynchronen Operation aufgetreten. 
              Bitte versuchen Sie es erneut.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Seite neu laden
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}