import React from 'react';
import { VariableGrid } from './VariableGrid';

interface VariableTableProps {
  variables: Record<string, any>;
}

export const VariableTable: React.FC<VariableTableProps> = ({ variables }) => {
  const variableNames = Object.keys(variables).sort();

  if (variableNames.length === 0) {
    return (
      <div className="text-slate-500 text-center py-8 italic text-sm">
        No variables in scope yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {variableNames.map((name) => {
        const value = variables[name];
        const isArray = Array.isArray(value);
        const isMatrix = isArray && Array.isArray(value[0]);

        return (
          <div key={name} className="bg-slate-800/50 rounded-md border border-slate-700 overflow-hidden">
            <div className="bg-slate-800 px-3 py-2 border-b border-slate-700 flex justify-between items-center">
              <span className="font-mono text-indigo-400 font-bold text-sm">{name}</span>
              <span className="text-xs text-slate-500 font-mono">
                {isMatrix ? 'int[][]' : isArray ? 'int[]' : typeof value}
              </span>
            </div>
            
            <div className="p-3">
              {isArray ? (
                <VariableGrid data={value} label={name} />
              ) : (
                <span className="font-mono text-emerald-400 text-lg">
                    {JSON.stringify(value)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
