import { Component, type ErrorInfo, type ReactNode } from 'react'
import { logError } from '../lib/logger'

type Props = { children: ReactNode }
type State = { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logError('Unhandled UI error', { error, info })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto mt-10 max-w-xl rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
          <p className="text-sm">Please refresh the page. If it keeps happening, contact support.</p>
          {this.state.message && <p className="mt-2 text-xs opacity-80">{this.state.message}</p>}
        </div>
      )
    }
    return this.props.children
  }
}
