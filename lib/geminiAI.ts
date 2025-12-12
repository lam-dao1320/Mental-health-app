import { GoogleGenAI, Type } from "@google/genai";

const activityApiKey = process.env.EXPO_PUBLIC_ACTIVITY_API_KEY || "";
const planApiKey = process.env.EXPO_PUBLIC_PLAN_API_KEY || "";
const scoreApiKey = process.env.EXPO_PUBLIC_SCORE_API_KEY || "";

export const activityAI = new GoogleGenAI({ apiKey: activityApiKey });
export const planAI = new GoogleGenAI({ apiKey: planApiKey });
export const scoreAI = new GoogleGenAI({ apiKey: scoreApiKey })

export const activitiesSchema = {
  type: Type.OBJECT,
  properties: {
    chosen_category: {
      type: Type.STRING,
      description: 'The single most suitable stress-relief category based on the user status (e.g., "Mindful Breathing", "Gentle Desk Stretches").',
    },
    activities: {
      type: Type.ARRAY,
      description: 'A list of 3 specific activities within the chosen category.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: 'A concise name for the specific activity (e.g., "Box Breathing", "Shoulder Rolls").',
          },
          description: {
            type: Type.STRING,
            description: 'A brief instruction for the activity.',
          },
          link: {
            type: Type.STRING,
            description: 'A suggested URL (YouTube, article, or music) related to the activity.',
          },
        },
        required: ['name', 'description', 'link'],
      },
    },
  },
  required: ['chosen_category', 'activities'],
};

export const plansSchema = {
  type: Type.OBJECT,
  properties: {
    chosen_type: { 
      type: Type.STRING,
      description: 'The single activity type chosen from the list (e.g., "Nature/Movement", "Social/Reset").',
    },
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
  required: ['chosen_type', 'plan_activities'],
};

export const scoreSchema = {
  type: Type.OBJECT,
    description: 'An object containing the three updated wellness scores and the reasoning for the change.',
    properties: {
      depression_score: {
        type: Type.INTEGER,
        description: 'The NEW updated Depression Score (integer only).',
      },
      anxiety_score: {
        type: Type.INTEGER,
        description: 'The NEW updated Anxiety Score (integer only).',
      },
      overall_score: {
        type: Type.INTEGER,
        description: 'The NEW updated Overall Wellness Score (integer only).',
      },
      summary: {
        type: Type.STRING,
        description: 'A single, short summary (1-2 sentences) of the user\'s current emotional state and the general direction of the score change.',
      },
  },
  required: [
    'depression_score',
    'anxiety_score',
    'overall_score', 
    'summary'
  ],
}