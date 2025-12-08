// NOTE: This file is a browser-side stub. The real Gemini integration
// runs on the backend and is available at `/api/trace`.
export const generateExecutionTrace = async () => {
  throw new Error(
    'generateExecutionTrace is not available in the browser. \n' +
    'Run the backend and call the API endpoint `/api/trace` from the frontend.'
  );
};
