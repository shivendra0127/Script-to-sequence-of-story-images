
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-surface shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
          AI Storyboard Generator
        </h1>
        <p className="text-sm text-text-secondary">
          Bring your scripts to life with AI-powered visuals.
        </p>
      </div>
    </header>
  );
};
