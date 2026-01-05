
import { GoogleGenAI } from "@google/genai";
import { GenerationParams, ModelType } from "../types";

export const generateBookCover = async (params: GenerationParams): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Create a professional, stunning book cover design for a book titled "${params.title}"${params.author ? ` by ${params.author}` : ''}.
    Genre: ${params.genre}.
    Visual Style/Vibe: ${params.style}.
    Details: ${params.description}.
    
    The layout should be a standard portrait book cover. The title should be prominently featured in a high-quality, elegant font that matches the genre. Ensure the composition is balanced and cinematic.
  `;

  const config: any = {
    imageConfig: {
      aspectRatio: "3:4",
    }
  };

  // Only include imageSize for Pro model
  if (params.model === 'gemini-3-pro-image-preview') {
    config.imageConfig.imageSize = params.imageSize || '1K';
  }

  try {
    const response = await ai.models.generateContent({
      model: params.model,
      contents: {
        parts: [{ text: prompt }]
      },
      config
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in response");
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("PRO_KEY_REQUIRED");
    }
    console.error("Gemini API Error:", error);
    throw error;
  }
};
