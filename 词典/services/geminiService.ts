import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WordDefinition } from "../types.ts";

// Declare process to avoid TypeScript errors during build
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};

const wordSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING, description: "The Chinese word or character queried." },
    pinyin: { type: Type.STRING, description: "The Pinyin pronunciation with tone marks." },
    basicMeaning: { type: Type.STRING, description: "A concise definition of the word." },
    detailedMeaning: { type: Type.STRING, description: "A detailed explanation of the word's nuances." },
    nuanceMeaning: { type: Type.STRING, description: "An explanation of the specific focus, connotation, or emotional coloring of the word (e.g., what it emphasizes compared to synonyms)." },
    examples: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 distinct example sentences in Chinese showing how the word is used.",
    },
    etymology: { type: Type.STRING, description: "Brief origin or structural breakdown of the character/word." }
  },
  required: ["word", "pinyin", "basicMeaning", "detailedMeaning", "nuanceMeaning", "examples"],
};

export const lookupWord = async (query: string): Promise<WordDefinition> => {
  try {
    // Initialize inside function to avoid immediate access to process.env during module import
    const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";
    const prompt = `You are a distinguished Chinese lexicographer and philologist. 
    Analyze the following Chinese word or character: "${query}".
    Provide a structured dictionary entry containing its pinyin, basic definition, detailed explanation, a specific explanation of the word's nuance/focus (what aspect it emphasizes, its connotation, or usage context), 3 example sentences, and brief etymology.
    If the input is not a valid Chinese word, find the closest matching Chinese term or interpret the intent.
    Ensure the content is high-quality, academic yet accessible, suitable for a dictionary app.`;

    const result = await genAI.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: wordSchema,
        systemInstruction: "You are a helpful, precise Chinese dictionary assistant. Output valid JSON only.",
      },
    });

    const text = result.text;
    if (!text) {
      throw new Error("No data received from AI.");
    }

    const data = JSON.parse(text) as WordDefinition;
    return data;
  } catch (error) {
    console.error("Dictionary Lookup Error:", error);
    throw error;
  }
};