
export interface Scene {
  sceneNumber: number;
  description: string;
  imagePrompt: string;
}

export interface StoryboardItem {
  scene: Scene;
  imageUrl: string | null | 'error';
  isLoading: boolean;
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}
