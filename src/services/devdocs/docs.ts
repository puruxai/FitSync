// FitSync API Documentation Service
// Retrieves OpenAPI JSON configurations programmatically for developer portal widgets

export const ApiDocumentationService = {
  /**
   * Retrieves full OpenAPI spec payload
   */
  async getOpenApiSpec(): Promise<any> {
    try {
      const res = await fetch('/openapi.json');
      if (!res.ok) throw new Error('OpenAPI file not found');
      return await res.json();
    } catch {
      // Mock static fallback payload
      return {
        openapi: '3.1.0',
        info: {
          title: 'FitSync Enterprise API (Local Mode)',
          version: '1.4.0'
        }
      };
    }
  }
};
export default ApiDocumentationService;
