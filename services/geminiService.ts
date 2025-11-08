
import { GoogleGenAI, Type } from "@google/genai";
import type { Scene } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Processes a script and breaks it down into scenes with image prompts.
 * @param scriptText The full text of the script.
 * @returns A promise that resolves to an array of scenes.
 */
export const processScript = async (scriptText: string): Promise<Scene[]> => {
  const model = 'gemini-2.5-flash';
  
  const prompt = `
    You are a professional storyboard artist. Analyze the following script and break it down into distinct, visually compelling scenes. 
    For each scene, provide a concise description and a detailed, artistic image generation prompt.
    The image prompt should be suitable for a text-to-image model and include details about characters, setting, lighting, camera angle, and mood.
    Return the output as a JSON array.

    SCRIPT:
    ---
    ${scriptText}
    ---
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    sceneNumber: {
                        type: Type.INTEGER,
                        description: "The sequential number of the scene.",
                    },
                    description: {
                        type: Type.STRING,
                        description: "A short description of the action and dialogue in the scene.",
                    },
                    imagePrompt: {
                        type: Type.STRING,
                        description: "A detailed prompt for an image generation model. Include style hints like 'cinematic, dramatic lighting, 4k'."
                    }
                },
                required: ["sceneNumber", "description", "imagePrompt"],
            }
        }
    }
  });

  try {
    const jsonText = response.text.trim();
    const scenes = JSON.parse(jsonText);
    if (!Array.isArray(scenes)) {
        throw new Error("Response is not a JSON array.");
    }
    return scenes as Scene[];
  } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", response.text);
      throw new Error("The AI failed to return a valid scene structure. Please try again with a clearer script.");
  }
};

/**
 * Generates an image based on a prompt using the Imagen model.
 * @param prompt The detailed prompt for image generation.
 * @returns A promise that resolves to a base64 encoded image string.
 */
export const generateImage = async (prompt: string): Promise<string> => {
  const model = 'imagen-4.0-generate-001';
  
  const response = await ai.models.generateImages({
    model: model,
    prompt: prompt,
    config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
    }
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } else {
    throw new Error("Image generation failed, no images returned.");
  }
};
