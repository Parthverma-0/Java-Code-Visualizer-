import { GoogleGenAI, Type } from "@google/genai";
import type { TraceStep, ExecutionTrace } from '../types.ts';

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;   // <-- change this line
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

const TRACE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING, enum: ['success', 'error'] },
    error: { type: Type.STRING },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          line: { type: Type.INTEGER, description: "The 1-based line number currently being executed." },
          variables: { 
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.STRING, description: "The value. Arrays/Objects must be JSON strings." },
                type: { type: Type.STRING }
              },
              required: ['name', 'value']
            }
          },
          explanation: { type: Type.STRING, description: "A very short, one-sentence explanation of what just happened." },
          stdout: { type: Type.STRING, description: "The accumulated standard output (console) text up to this step." }
        },
        required: ['line', 'variables', 'explanation', 'stdout']
      }
    }
  },
  required: ['status', 'steps']
};

export const generateExecutionTrace = async (code: string): Promise<ExecutionTrace> => {
  const ai = getClient();
  
  const prompt = `
    You are a Java Code Execution Engine. 
    Your task is to perform a detailed "Dry Run" of the provided Java code.
    
    Instructions:
    1. Parse the code mentally.
    2. Simulate the execution line by line.
    3. Generate a trace step for every significant line of code executed.
    4. For loops, ensure you output a step for every iteration.
    5. **PERFORMANCE OPTIMIZATION**: In the 'variables' list, **ONLY** include variables that have **CHANGED** or are **NEWLY DEFINED** in this specific step. Do NOT re-list variables that haven't changed.
    6. IMPORTANT: For Arrays and Matrices, the 'value' field MUST be a valid JSON string (e.g. "[[1,2],[3,4]]").
    7. If the code has a syntax error or runtime error, set status to 'error' and provide a description.
    8. Limit the execution to the first 25 steps to ensure a fast response.
    9. Return the result strictly in JSON format matching the schema.

    Java Code:
    ${code}
  `;

  try {
    const apiCall = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: TRACE_SCHEMA,
        temperature: 0.1, 
      }
    });

    const timeoutPromise = new Promise<any>((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out after 60 seconds. Please try again or simplify the code.")), 60000)
    );

    const response = await Promise.race([apiCall, timeoutPromise]);

    let text = response.text || '{}';
    if (text.startsWith('```')) {
        text = text.replace(/^```(json)?\n/, '').replace(/```$/, '');
    }

    const rawResult = JSON.parse(text);
    
    if (rawResult.status === 'error' && !rawResult.steps) {
        return { status: 'error', error: rawResult.error || "Execution failed", steps: [] };
    }

    let currentVariablesState: Record<string, any> = {};

    const steps: TraceStep[] = (rawResult.steps || []).map((step: any) => {
        const stepUpdates: Record<string, any> = {};
        
        if (Array.isArray(step.variables)) {
            step.variables.forEach((v: any) => {
                let parsedValue = v.value;
                if (typeof v.value === 'string') {
                    const trimmed = v.value.trim();
                    if ((trimmed.startsWith('[') || trimmed.startsWith('{') || trimmed === 'true' || trimmed === 'false' || /^-?\d+(\.\d+)?$/.test(trimmed))) {
                         try {
                             parsedValue = JSON.parse(trimmed);
                         } catch (e) {
                             parsedValue = v.value;
                         }
                    }
                }
                stepUpdates[v.name] = parsedValue;
            });
        }

        currentVariablesState = { ...currentVariablesState, ...stepUpdates };

        return {
            line: step.line,
            explanation: step.explanation,
            stdout: step.stdout,
            variables: { ...currentVariablesState }
        };
    });

    return {
        status: rawResult.status || 'success',
        error: rawResult.error,
        steps: steps
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return {
      status: 'error',
      error: error.message || "An unexpected error occurred during simulation.",
      steps: []
    };
  }
};
