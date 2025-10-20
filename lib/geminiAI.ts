import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";

console.log("Gemini API Key:", process.env.GEMINI_API_KEY);

export const ai = new GoogleGenAI({apiKey: apiKey});

export const quickStressActivitiesSchema = {
  type: Type.OBJECT,
  properties: {
    categories: {
      type: Type.ARRAY,
      description: 'A list of different stress relief categories.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: 'The name of the activity category (e.g., "Mindfulness", "Movement").',
          },
          activities: {
            type: Type.ARRAY,
            description: 'A list of 3 specific activities within this category.',
            items: {
              type: Type.OBJECT,
              properties: {
                description: {
                  type: Type.STRING,
                  description: 'A brief instruction for the activity.',
                },
                link: {
                  type: Type.STRING,
                  description: 'A suggested URL (YouTube, article, or music) related to the activity.',
                },
              },
              required: ['description', 'link'],
            },
          },
        },
        required: ['name', 'activities'],
      },
    },
  },
  required: ['categories'],
};