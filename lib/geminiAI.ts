import { GoogleGenAI, Type } from "@google/genai";

const activityApiKey = process.env.EXPO_PUBLIC_ACTIVITY_API_KEY || "";
const planApiKey = process.env.EXPO_PUBLIC_PLAN_API_KEY || "";

export const activityAI = new GoogleGenAI({apiKey: activityApiKey});
export const planAI = new GoogleGenAI({apiKey: planApiKey});

export const activitiesSchema = {
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

export const plansSchema = {
  type: Type.OBJECT,
  properties: {
    plan_activities: {
      type: Type.ARRAY,
      description: 'A list of three holistic, high-impact activities for stress reduction.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "The name of the planned activity (e.g., 'Weekend Camping Trip', 'Pottery Workshop')."
          },
          type: {
            type: Type.STRING,
            description: "The type of activity (Nature/Movement, Mind/Creative, or Social/Reset)."
          },
          details: {
            type: Type.STRING,
            description: "A 2-3 sentence description for what activity involves and how to begin planning it."
          },
          rationale: {
            type: Type.STRING,
            description: "A one-sentence justification for the activity based on stress reduction principles."
          },
        },
        required: ['name', 'type', 'rationale'] 
      },
    },
  },
  required: ['plan_activities'],
};