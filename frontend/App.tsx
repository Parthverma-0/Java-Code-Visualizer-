import React, { useState, useEffect, useRef, useCallback } from 'react';
// The execution trace generation now runs on a server endpoint.
// Frontend calls POST /api/trace with { code } and receives the trace.
import { TraceStep, ExecutionTrace, PlayerState } from './types';
import { CodeDisplay } from './components/CodeDisplay';
import { VariableTable } from './components/VariableTable';
import { Controls } from './components/Controls';
import { DEFAULT_JAVA_CODE, SAMPLE_BUBBLE_SORT } from './constants';

const App: React.FC = () => {
  const [code, setCode] = useState<string>(DEFAULT_JAVA_CODE);
  const [trace, setTrace] = useState<TraceStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.IDLE);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTime, setLoadingTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to handle playing interval
  const timerRef = useRef<number | null>(null);
  const loadingIntervalRef = useRef<number | null>(null);

  const handleVisualize = async () => {
    setLoading(true);
    setLoadingTime(0);
    setError(null);
    setPlayerState(PlayerState.IDLE);
    setCurrentStepIndex(-1);
    setTrace([]);

    // Start loading timer for visual feedback
    loadingIntervalRef.current = window.setInterval(() => {
        setLoadingTime(prev => prev + 1);
    }, 1000);

    try {
      const resp = await fetch('/api/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const result = await resp.json();

      if (!resp.ok || result.status === 'error') {
        setError(result.error || 'Trace generation failed');
      } else {
        setTrace(result.steps || []);
        if ((result.steps || []).length > 0) setCurrentStepIndex(0);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to communicate with execution engine.');
    } finally {
      setLoading(false);
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
    }
  };

  const handleNext = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev < trace.length - 1) return prev + 1;
      setPlayerState(PlayerState.COMPLETED);
      return prev;
    });
  }, [trace.length]);

  const handlePrev = useCallback(() => {
    setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Playback Logic
  useEffect(() => {
    if (playerState === PlayerState.PLAYING) {
      timerRef.current = window.setInterval(() => {
        handleNext();
      }, 800); // 800ms per step
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playerState, handleNext]);

  // Stop playing if we reach the end
  useEffect(() => {
    if (trace.length > 0 && currentStepIndex >= trace.length - 1 && playerState === PlayerState.PLAYING) {
      setPlayerState(PlayerState.COMPLETED);
    }
  }, [currentStepIndex, trace.length, playerState]);

  const currentStepData = trace[currentStepIndex];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="text-white w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
            </div>
            <div>
                <h1 className="text-xl font-bold text-white tracking-tight">JavaViz</h1>
                <p className="text-xs text-slate-400">Educational Code Visualizer</p>
            </div>
        </div>
        
        <div className="flex gap-3">
             <button 
                onClick={() => setCode(DEFAULT_JAVA_CODE)} 
                className="text-xs text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-4"
            >
                Matrix Demo
            </button>
            <button 
                onClick={() => setCode(SAMPLE_BUBBLE_SORT)} 
                className="text-xs text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-4"
            >
                Sort Demo
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden max-h-[calc(100vh-64px)]">
        
        {/* LEFT: Code Editor & Visualizer */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800 bg-slate-950">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              Source Code
            </h2>
            <div className="flex gap-2">
                {!trace.length || loading ? (
                    <button
                        onClick={handleVisualize}
                        disabled={loading}
                        className={`px-4 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
                        loading 
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                        }`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>Compiling... {loadingTime}s</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3l14 9-14 9V3z"/></svg>
                                Visualize
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={() => { setTrace([]); setCurrentStepIndex(-1); setPlayerState(PlayerState.IDLE); }}
                        className="px-4 py-1.5 rounded text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                        Edit Code
                    </button>
                )}
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 relative overflow-hidden">
            {trace.length === 0 ? (
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full bg-slate-950 text-slate-300 font-mono p-4 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-sm leading-6"
                    spellCheck={false}
                    placeholder="Enter Java code here..."
                />
            ) : (
                <div className="h-full p-2">
                    <CodeDisplay 
                        code={code} 
                        currentLine={currentStepData?.line} 
                    />
                </div>
            )}
            
            {error && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-900/90 text-red-100 p-3 rounded-md border border-red-700 text-sm shadow-xl backdrop-blur-sm animate-pulse">
                    <div className="flex items-center gap-2 font-bold mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        Error
                    </div>
                    {error}
                </div>
            )}
          </div>

           {/* Playback Controls Footer (Only visible when trace exists) */}
           {trace.length > 0 && (
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-center">
                 <Controls
                    playerState={playerState}
                    currentStep={currentStepIndex}
                    totalSteps={trace.length}
                    onPlay={() => setPlayerState(PlayerState.PLAYING)}
                    onPause={() => setPlayerState(PlayerState.PAUSED)}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    onReset={() => {
                        setPlayerState(PlayerState.IDLE);
                        setCurrentStepIndex(0);
                    }}
                 />
            </div>
           )}
        </div>

        {/* RIGHT: Variable Scope & Console */}
        <div className="w-full lg:w-[400px] xl:w-[450px] bg-slate-900 flex flex-col border-l border-slate-800">
          
          {/* Section: Variables */}
          <div className="flex-1 flex flex-col min-h-0">
             <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    Variables & Memory
                </h2>
             </div>
             <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {currentStepData ? (
                    <VariableTable variables={currentStepData.variables} />
                ) : (
                    <div className="text-slate-600 text-center mt-10 text-sm">
                        Waiting for execution to start...
                    </div>
                )}
             </div>
          </div>

          {/* Section: Output/Console & Explanation */}
          <div className="h-1/3 border-t border-slate-800 flex flex-col bg-slate-950">
             <div className="flex items-center bg-slate-900 border-b border-slate-800">
                <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-slate-800">Explanation</div>
                <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Console Output</div>
             </div>
             
             <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-4">
                {currentStepData ? (
                    <>
                        <div className="text-indigo-300 border-l-2 border-indigo-500 pl-3 italic">
                            {currentStepData.explanation}
                        </div>
                        {currentStepData.stdout && (
                            <div className="text-slate-400 pt-2 border-t border-slate-800/50 mt-2">
                                <span className="text-slate-600 block text-[10px] mb-1">STDOUT:</span>
                                <pre className="whitespace-pre-wrap">{currentStepData.stdout}</pre>
                            </div>
                        )}
                    </>
                ) : (
                    <span className="text-slate-600"> Ready to run...</span>
                )}
             </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default App;
