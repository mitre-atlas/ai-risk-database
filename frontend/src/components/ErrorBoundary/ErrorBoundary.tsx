import React from "react";
import ErrorPage from "next/error";
import { logClientError } from "@/helpers/client-error-logging";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI

    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can use your own error logging service here
    logClientError(error);

    const componentStackError = new Error(`Component: ${error.message}`);
    componentStackError.stack = errorInfo.componentStack;
    logClientError(componentStackError);
    console.error(error);
    console.error(errorInfo);
  }

  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <ErrorPage
          title="We are sorry, this is an unexpected error"
          statusCode={500}
        />
      );
    }

    // Return children components in case of no error

    return this.props.children;
  }
}

export default ErrorBoundary;
