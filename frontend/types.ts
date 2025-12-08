export interface VariableValue {
  type: 'primitive' | 'array' | 'matrix' | 'string' | 'object';
  value: any;
}

export interface TraceStep {
  line: number; // 1-based line number
  variables: Record<string, any>; // Map of variable name to value
  explanation: string; // Brief description of what happened this step
  stdout: string; // Console output up to this point
}

export interface ExecutionTrace {
  status: 'success' | 'error';
  error?: string;
  steps: TraceStep[];
}

export enum PlayerState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED'
}
