import React from 'react';

export default function BorderBeam({
  className = '',
  color = '#16A34A',
  duration = 7
}) {
  return (
    <div className={`pointer-events-none absolute inset-0 rounded-[inherit] p-[1px] overflow-hidden ${className}`}>
      <div
        className="absolute -inset-[100%] animate-spin"
        style={{
          animationDuration: `${duration}s`,
          background: `conic-gradient(from 0deg, transparent 0 320deg, ${color} 360deg)`
        }}
      />
      <div className="absolute inset-[1px] rounded-[inherit] bg-white" />
    </div>
  );
}
