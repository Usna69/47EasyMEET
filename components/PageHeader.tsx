import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  bgImage?: string;
}

export default function PageHeader({ title, subtitle, bgImage }: PageHeaderProps) {
  return (
    <div className="bg-primary relative py-16 overflow-hidden">
      {bgImage && (
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center" 
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      <div className="container relative z-10 mx-auto text-white">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        {subtitle && <p className="text-xl text-white/80 max-w-3xl">{subtitle}</p>}
      </div>
    </div>
  );
}
