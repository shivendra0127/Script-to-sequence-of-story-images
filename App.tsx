
import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { StoryboardPanel } from './components/StoryboardPanel';
import { ChatBot } from './components/ChatBot';
import { Header } from './components/Header';
import { processScript, generateImage } from './services/geminiService';
import type { Scene, StoryboardItem, ChatMessage } from './types';
import { Chat } from '@google/genai';
import { GoogleGenAI } from '@google/genai';

const App: React.FC = () => {
  const [script, setScript] = useState<string>('');
  const [storyboard, setStoryboard] = useState<StoryboardItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);

  const handleFileUpload = (content: string) => {
    setScript(content);
    setStoryboard([]);
    setError(null);
  };

  const handleGenerateStoryboard = useCallback(async () => {
    if (!script) {
      setError('Please upload a script first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setStoryboard([]);

    try {
      const scenes: Scene[] = await processScript(script);
      const initialStoryboard: StoryboardItem[] = scenes.map(scene => ({
        scene,
        imageUrl: null,
        isLoading: true,
      }));
      setStoryboard(initialStoryboard);

      const imagePromises = scenes.map(async (scene) => {
        try {
          const imageUrl = await generateImage(scene.imagePrompt);
          return { scene, imageUrl };
        } catch (imgError) {
          console.error(`Failed to generate image for scene ${scene.sceneNumber}:`, imgError);
          return { scene, imageUrl: 'error' }; // Special value to indicate error
        }
      });
      
      const settledImages = await Promise.all(imagePromises);
      
      setStoryboard(currentStoryboard => {
          const updatedStoryboard = [...currentStoryboard];
          settledImages.forEach(({ scene, imageUrl }) => {
              const index = updatedStoryboard.findIndex(item => item.scene.sceneNumber === scene.sceneNumber);
              if (index !== -1) {
                  updatedStoryboard[index] = { scene, imageUrl, isLoading: false };
              }
          });
          return updatedStoryboard;
      });

    } catch (e) {
      console.error(e);
      setError('Failed to process the script. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [script]);
  
  const getChat = useCallback(() => {
    if (chat) {
        return chat;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const newChat = ai.chats.create({
        model: 'gemini-2.5-flash',
    });
    setChat(newChat);
    return newChat;
  }, [chat]);


  return (
    <div className="min-h-screen bg-brand-bg text-text-main font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1 flex flex-col gap-8">
            <div className="bg-surface rounded-lg shadow-lg p-6 flex flex-col gap-4">
              <h2 className="text-xl font-bold text-white">1. Your Script</h2>
              <FileUpload onFileUpload={handleFileUpload} />
              {script && (
                <div className="mt-4 max-h-60 overflow-y-auto p-3 bg-brand-bg rounded-md border border-border-color">
                  <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans">{script}</pre>
                </div>
              )}
              <button
                onClick={handleGenerateStoryboard}
                disabled={!script || isLoading}
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  '2. Generate Storyboard'
                )}
              </button>
            </div>
             <ChatBot getChat={getChat} />
          </aside>

          <section className="lg:col-span-2">
            <StoryboardPanel storyboard={storyboard} isLoading={isLoading} error={error} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;
