import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught UI error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: "#FFFBF5" }}>
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-orange-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">
              ⚡
            </div>
            <h2 className="font-heading text-xl font-bold text-gray-900 mb-2">
              कुछ गड़बड़ हो गई / Something went wrong
            </h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              चिंता न करें, आपके आइटम सुरक्षित हैं। कृपया नीचे दिए बटन से पेज रिफ्रेश करें।
              <br />
              <span className="text-xs text-gray-400 font-mono mt-1 block">Don't worry, tap below to reload menu.</span>
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              🔄 Refresh Page / पेज रिफ्रेश करें
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
