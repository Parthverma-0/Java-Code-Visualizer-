import React, { useMemo } from 'react';

interface CodeDisplayProps {
  code: string;
  currentLine: number | null;
  onLineClick?: (line: number) => void;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ code, currentLine, onLineClick }) => {
  const lines = useMemo(() => code.split('\n'), [code]);

  return (
    <div className="font-mono text-sm leading-6 relative bg-slate-950 p-4 rounded-lg border border-slate-800 h-full overflow-auto">
      <div className="absolute top-0 left-0 bottom-0 w-8 bg-slate-900 border-r border-slate-800 z-10" />
      {lines.map((line, index) => {
        const lineNumber = index + 1;
        const isCurrent = lineNumber === currentLine;

        return (
          <div
            key={index}
            className={`relative pl-12 pr-4 flex items-center group transition-colors duration-150 ${
              isCurrent ? 'bg-indigo-900/30' : 'hover:bg-slate-900'
            }`}
            onClick={() => onLineClick?.(lineNumber)}
          >
            {/* Line Number */}
            <span className={`absolute left-0 w-8 text-right pr-2 select-none ${
              isCurrent ? 'text-indigo-400 font-bold' : 'text-slate-600'
            }`}>
              {lineNumber}
            </span>

            {/* Current Line Indicator */}
            {isCurrent && (
              <div className="absolute left-0 w-1 h-full bg-indigo-500" />
            )}

            {/* Code Content */}
            <pre className={`whitespace-pre-wrap break-all ${isCurrent ? 'text-indigo-100' : 'text-slate-300'}`}>
              {line || ' '}
            </pre>
          </div>
        );
      })}
    </div>
  );
};
