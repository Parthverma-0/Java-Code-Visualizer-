import React from 'react';

interface VariableGridProps {
  data: any[];
  label: string;
}

export const VariableGrid: React.FC<VariableGridProps> = ({ data, label }) => {
  const is2D = Array.isArray(data[0]);

  if (is2D) {
    return (
      <div className="flex flex-col gap-1">
        {data.map((row: any[], i) => (
          <div key={i} className="flex gap-1">
            {row.map((cell, j) => (
              <div 
                key={`${i}-${j}`} 
                className="w-10 h-10 flex items-center justify-center bg-slate-900 border border-slate-600 text-slate-200 font-mono text-sm rounded relative group hover:border-indigo-500 transition-colors"
                title={`${label}[${i}][${j}] = ${cell}`}
              >
                {cell}
                {/* Tooltipish index indicator */}
                <div className="absolute -top-2 -left-2 text-[0.5rem] text-slate-600 opacity-0 group-hover:opacity-100 bg-slate-950 px-1 rounded">
                    {i},{j}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // 1D Array
  return (
    <div className="flex flex-wrap gap-1">
      {data.map((cell, i) => (
        <div key={i} className="flex flex-col items-center">
             <div className="text-[0.6rem] text-slate-500 mb-0.5 font-mono">{i}</div>
            <div 
                className="w-10 h-10 flex items-center justify-center bg-slate-900 border border-slate-600 text-slate-200 font-mono text-sm rounded"
                title={`${label}[${i}] = ${cell}`}
            >
                {cell}
            </div>
        </div>
      ))}
    </div>
  );
};
