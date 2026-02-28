export interface AgentMessage {
  role: 'user' | 'agent';
  text: string;
  toolCalls?: string[];
  loading?: boolean;
}
