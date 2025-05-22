import React, { Component } from 'react';
import { Win95Button } from './Win95Button';
interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };
  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }
  private handleReload = () => {
    window.location.reload();
  };
  public render() {
    if (this.state.hasError) {
      return <div className="min-h-screen bg-teal-600 flex items-center justify-center p-4">
          <div className="bg-gray-300 border-2 border-white border-r-gray-800 border-b-gray-800 p-6 max-w-md w-full">
            <div className="bg-blue-900 text-white px-2 py-1 font-bold mb-4">
              Error
            </div>
            <div className="space-y-4">
              <div className="bg-white p-4 border-2 border-gray-600 border-t-gray-800 border-l-gray-800 font-mono text-sm">
                <p className="text-red-600 mb-2">An error has occurred:</p>
                <p className="break-words">{this.state.error?.message}</p>
              </div>
              <div className="flex justify-end">
                <Win95Button onClick={this.handleReload} className="px-4 py-2 font-mono">
                  Reload Application
                </Win95Button>
              </div>
            </div>
          </div>
        </div>;
    }
    return this.props.children;
  }
}