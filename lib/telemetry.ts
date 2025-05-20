import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';

// Set log level to WARN/ERROR in development
if (process.env.NODE_ENV === 'development') {
  diag.setLogger(new DiagConsoleLogger(), {
    logLevel: DiagLogLevel.WARN, // or DiagLogLevel.ERROR
  });
} else {
  // Disable logging in production
  diag.disable();
}
class FilteredConsoleLogger extends DiagConsoleLogger {
  override error = (message: string, ...args: unknown[]): void => {
    // Ignore exporter retry errors
    if (message.includes('Export retry failed') || message.includes('Exporter error')) {
      return;
    }
    DiagConsoleLogger.prototype.error.call(this, message, ...args);
  }
}

// Apply the filtered logger
diag.setLogger(new FilteredConsoleLogger());

const sdk = new NodeSDK({
  // Disable auto-logging for spans/metrics
  traceExporter: new ConsoleSpanExporter(), // Replace with your actual exporter
  instrumentations: [], // Add your instrumentations
});

// Handle SDK errors gracefully with proper type safety
const startTelemetry = async () => {
  try {
    await sdk.start();
  } catch (err) {
    console.error('OpenTelemetry SDK failed to start:', err);
    // Ensure we don't throw from shutdown
    try {
      await sdk.shutdown();
    } catch (shutdownErr) {
      console.error('Failed to shutdown OpenTelemetry SDK:', shutdownErr);
    }
  }
};

void startTelemetry();
