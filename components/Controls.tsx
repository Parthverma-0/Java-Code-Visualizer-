import React from 'react';
import { PlayerState } from '../types';

interface ControlsProps {
  playerState: PlayerState;
  currentStep: number;
  totalSteps: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
}

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-md font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  />
);

export const Controls: React.FC<ControlsProps> = ({
  playerState,
  currentStep,
  totalSteps,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReset,
}) => {
  const isPlaying = playerState === PlayerState.PLAYING;
  const isFinished = currentStep >= totalSteps - 1;
  const isStart = currentStep <= 0;

  return (
    <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-lg">
      <Button
        onClick={onReset}
        className="text-slate-300 hover:text-white hover:bg-slate-700"
        title="Reset"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
      </Button>

      <div className="w-px h-6 bg-slate-600 mx-1" />

      <Button
        onClick={onPrev}
        disabled={isStart || isPlaying}
        className="text-indigo-300 hover:bg-indigo-900/40 disabled:text-slate-600"
        title="Previous Step"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>
      </Button>

      {isPlaying ? (
        <Button
          onClick={onPause}
          className="bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-900/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        </Button>
      ) : (
        <Button
          onClick={onPlay}
          disabled={isFinished}
          className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3l14 9-14 9V3z"/></svg>
        </Button>
      )}

      <Button
        onClick={onNext}
        disabled={isFinished || isPlaying}
        className="text-indigo-300 hover:bg-indigo-900/40 disabled:text-slate-600"
        title="Next Step"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 17 5-5-5-5"/><path d="m6 17 5-5-5-5"/></svg>
      </Button>

      <div className="w-px h-6 bg-slate-600 mx-1" />
      
      <div className="flex flex-col px-2">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Step</span>
        <span className="text-sm font-mono text-white leading-none">
          {currentStep + 1} <span className="text-slate-500">/</span> {totalSteps > 0 ? totalSteps : '-'}
        </span>
      </div>
    </div>
  );
};
