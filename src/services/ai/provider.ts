// FitSync AI Provider Abstraction Interface
// Defines contracts for generating and streaming responses from pluggable AI backends

export interface MessagePayload {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIProvider {
  name: string;
  generateResponse(prompt: string, history?: MessagePayload[]): Promise<string>;
  streamResponse(
    prompt: string,
    history?: MessagePayload[],
    onChunk?: (text: string) => void
  ): Promise<string>;
}
