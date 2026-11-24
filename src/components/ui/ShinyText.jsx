import React from 'react';

export default function ShinyText({ 
  text, 
  children,
  className = '', 
  variant = 'brand' 
}) {
  const content = text || children;
  const variantClass = variant === 'white' ? 'shiny-text-white' : 'shiny-text';
  
  return (
    <span className={`inline-block font-extrabold tracking-tight ${variantClass} ${className}`}>
      {content}
    </span>
  );
}
