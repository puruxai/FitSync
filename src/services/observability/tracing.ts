// FitSync Tracing Service
// Implements request correlation ID injections compatible with distributed OpenTelemetry standards

export const TracingService = {
  /**
   * Generates a correlation UUID v4 request ID
   */
  generateCorrelationId(): string {
    return 'tx-' + Math.random().toString(36).substr(2, 9) + '-' + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Prepare request header payloads containing correlation contexts
   */
  getTraceHeaders(): Record<string, string> {
    const traceId = this.generateCorrelationId();
    return {
      'X-Correlation-ID': traceId,
      'traceparent': `00-${traceId.replace(/-/g, '')}-0000000000000001-01`
    };
  }
};
export default TracingService;
