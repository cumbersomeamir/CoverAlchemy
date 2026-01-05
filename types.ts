
export type ModelType = 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview';

export interface GenerationParams {
  title: string;
  author?: string;
  description: string;
  genre: string;
  style: string;
  model: ModelType;
  imageSize?: '1K' | '2K' | '4K';
}

export interface GeneratedCover {
  id: string;
  url: string;
  timestamp: number;
  params: GenerationParams;
}

declare global {
  // Define AIStudio interface in the global scope to resolve type identification conflicts
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Use the named AIStudio interface and add readonly modifier to match the environment's global declaration
    readonly aistudio: AIStudio;
  }
}
