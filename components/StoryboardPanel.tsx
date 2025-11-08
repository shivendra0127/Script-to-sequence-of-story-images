
import React from 'react';
import type { StoryboardItem } from '../types';

interface StoryboardPanelProps {
  storyboard: StoryboardItem[];
  isLoading: boolean;
  error: string | null;
}

const Placeholder: React.FC = () => (
  <div className="w-full h-full bg-brand-bg rounded-lg animate-pulse-fast"></div>
);

const ErrorCard: React.FC = () => (
    <div className="w-full h-full bg-red-900/20 border-2 border-red-500/50 rounded-lg flex flex-col items-center justify-center text-center p-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="font-semibold text-red-400">Image Failed</p>
        <p className="text-xs text-red-400/80">Could not generate image for this scene.</p>
    </div>
);

export const StoryboardPanel: React.FC<StoryboardPanelProps> = ({ storyboard, isLoading, error }) => {
  
  const hasContent = storyboard.length > 0;
  
  if (error) {
    return (
      <div className="bg-surface rounded-lg shadow-lg p-6 flex flex-col items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  if (!hasContent && !isLoading) {
      return (
        <div className="bg-surface rounded-lg shadow-lg p-6 flex flex-col items-center justify-center min-h-[500px] border-2 border-dashed border-border-color">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-text-secondary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-bold text-white">Your Storyboard Awaits</h3>
            <p className="text-text-secondary mt-2">Upload a script and click "Generate" to see the magic happen.</p>
        </div>
      );
  }

  return (
    <div className="bg-surface rounded-lg shadow-lg p-4 md:p-6">
      <h2 className="text-xl font-bold text-white mb-4">3. Your Storyboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {storyboard.map((item) => (
          <div key={item.scene.sceneNumber} className="bg-brand-bg rounded-lg overflow-hidden shadow-md border border-border-color">
            <div className="aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
              {item.isLoading ? <Placeholder /> :
               item.imageUrl === 'error' ? <ErrorCard /> :
               item.imageUrl ? <img src={item.imageUrl} alt={`Scene ${item.scene.sceneNumber}`} className="w-full h-full object-cover" /> : <Placeholder />
              }
            </div>
            <div className="p-4">
              <h3 className="font-bold text-primary">Scene {item.scene.sceneNumber}</h3>
              <p className="text-sm text-text-secondary mt-1">{item.scene.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
