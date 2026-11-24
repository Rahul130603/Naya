import React, { useRef, useState } from 'react';

export default function MagneticButton({
  children,
  className = '',
  strength = 0.2, // Strength of magnetic pull
  onClick,
  ...props
}) {
  const btnRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!btnRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = btnRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const moveX = (clientX - centerX) * strength;
    const moveY = (clientY - centerY) * strength;
    setPosition({ x: moveX, y: moveY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: position.x === 0 && position.y === 0 ? 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'transform 0.1s ease-out'
      }}
      className={`will-change-transform ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
