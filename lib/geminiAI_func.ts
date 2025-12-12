import { activitiesSchema, activityAI, planAI, plansSchema, scoreAI, scoreSchema } from "./geminiAI";

const mockActivity = {"chosen_category": "Mindful Breathing", "activities": [{"name": "Box Breathing", "description": "Inhale slowly for 4 counts, hold your breath for 4 counts, exhale slowly for 4 counts, then hold your breath again for 4 counts. Repeat this cycle several times.", "link": "https://www.youtube.com/watch?v=F0B0fQ7u-20"}, {"name": "4-7-8 Breathing", "description": "Inhale quietly through your nose for 4 counts, hold your breath for a count of 7, and then exhale completely through your mouth, making a 'whoosh' sound, for a count of 8. Repeat for 3-4 cycles.", "link": "https://www.youtube.com/watch?v=YRPh_Ghnw04"}, {"name": "Diaphragmatic Breathing (Belly Breathing)", "description": "Sit comfortably and place one hand on your chest and the other on your belly. Breathe in deeply through your nose, allowing your belly to rise. Exhale slowly through pursed lips, feeling your belly fall. Focus on making your belly move more than your chest.", "link": "https://www.youtube.com/watch?v=0hK206e2v5I"}]};
const mockPlan = {
  "chosen_type": "Nature/Movement",
  "plan_activities": [
    {
      "name": "Weekend Hiking Getaway",
      "type": "Nature/Movement",
      "rationale": "Engaging in a multi-day outdoor experience combines physical exertion with nature immersion, proven to reduce stress and improve mood.",
      "details": "Plan a 2-3 day hiking trip to a national or state park. This involves researching trails, packing essentials, and spending extended time disconnected in nature, which can significantly alleviate mild depression and anxiety by fostering a sense of accomplishment and perspective."
    },
    {
      "name": "Weekly Scenic Bike Ride",
      "type": "Nature/Movement",
      "rationale": "Consistent moderate physical activity in a natural setting boosts endorphins and provides a regular mental break from daily stressors.",
      "details": "Identify a scenic bike path or trail near you and commit to a 1-2 hour ride once a week. The rhythmic motion of cycling combined with fresh air and changing scenery offers a meditative quality, helping to reduce anxiety and uplift mood over time."
    },
    {
      "name": "Mindful Nature Walk & Photography",
      "type": "Nature/Movement",
      "rationale": "Combining gentle movement with a creative, observational task encourages mindfulness and appreciation for the natural world, diverting focus from internal stressors.",
      "details": "Take a dedicated 30-60 minute walk in a local park or botanical garden, focusing on observing details and perhaps capturing them with your phone camera. This practice encourages present-moment awareness and connection with your surroundings, which can be a powerful antidote to mild anxiety and depressive thoughts."
    }
  ]
}
const mockScore = {"anxiety_score": 5, "depression_score": 8, "overall_score": 12, "summary": "The user is experiencing significant relief and reduced stress after completing a major project. This positive milestone has improved their anxiety and overall emotional state."};

export async function suggestActivities(status: string) {
    // Construct the prompt for the AI model
    const prompt = 
       `${status}. 
        You are an AI Wellness Coach.
        Your goal is to first **select the single most suitable category** of stress-relief activity for the user's current status, given they have 30 minutes, are at their desk, and needs a non-disruptive activity.
        Then, list 3 specific activities that fit this single chosen category. 
        For each activity, provide its **name**, brief instructions, and a helpful resource link.`;

    // console.log("AI Activity Suggestion Prompt:\n", prompt);

    try {
        const response = await activityAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: activitiesSchema,
                temperature: 0.5,
            }
        });
        // console.log("AI Response Text:\n", response.text?.trim());

        // Parse the JSON string from the response text and return the object
        if (!response.text) {
            throw new Error("AI response text is empty");
        }
        // console.log("Activity response: ", response);
        const jsonStr = response.text.trim();
        // console.log("Activity: ", jsonStr);
        return JSON.parse(jsonStr);

    } catch (error) {
        console.log("Error generating activity suggestions:", error);
        return mockActivity;
    }
}

// Define the static, reusable part of the prompt
const PLANNING_GUIDE = `
  You are an AI Wellness Consultant and Action Planner. Analyze user scores based on these scales:
  - Depression Score: (0-4: minimal, 7-13: mild, 14-20: moderate, 21-27: moderately severe, 28+: severe)
  - Anxiety Score: (0-4: minimal, 5-9: mild, 10-14: moderate, 15+: severe)
  - Overall Wellness Score: (0-8: excellent, 9-16: good, 17-24: moderate concerns, 25-32: significant concerns, 33-40: severe concerns)
  
  Your task is to generate a personalized three-part action plan for stress reduction.
`;

export async function suggestPlans(profile: any) {
    // Construct the dynamic part of the prompt
    const prompt = `
        Based on the user's current scores:
        - Depression: ${profile.depression}
        - Anxiety: ${profile.anxiety}
        - Overall Wellness: ${profile.overall}

        You are an AI Wellness Coach generating a self-managed action plan.

        **CRITICAL TASK:** Select the single most suitable activity type from the list below to best address the user's wellness scores, and then generate a plan consisting of **THREE (3)** high-impact activities related *only* to that chosen type.

        Activity Type Options (Choose exactly one):
        1. **Nature/Movement**
        2. **Mind/Creative**
        3. **Social/Reset**
        4. **Skill Acquisition** (Suggest learning a small, engaging skill)
        5. **Digital Detox/Focus** (Suggest an activity to disconnect from technology)

        The activities suggested (e.g., 'traveling', 'camping', 'pottery') must be holistic experiences that require planning.

        **CRITICAL INSTRUCTION:** For each of the three activities, include a 2-3 sentence description in the 'details' field explaining what the activity involves and how it addresses the user's scores. Ensure the output strictly follows the provided JSON schema.
    `;
    
    // console.log("AI Plan Suggestion Prompt:\n", prompt);
    try {
        const response = await planAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: plansSchema,
                temperature: 0.5,
                systemInstruction: PLANNING_GUIDE,
            }
        });
        // console.log("AI Plan Response Text:\n", response.text?.trim());

        // Parse the JSON string from the response text and return the object
        if (!response.text) {
            // return mockScore;
            throw new Error("AI response text is empty");
        }

        // console.log("Plan response: ", response);
        const jsonStr = response.text.trim();
        // console.log("Plan: ", jsonStr);
        return JSON.parse(jsonStr);

    } catch (error) {
        console.log("Error generating wellness plans:", error);
        return mockPlan;
    }
}

const SCORING_GUIDE = `
    You are an AI Wellness Evaluator. Your task is to analyze a user's new daily status update (an emoji and a diary entry) in the context of their current scores, and determine how each score should be adjusted (up or down).

    Use these clinical ranges as context for the user's starting point:
    - Depression Score: (0-4: minimal, 7-13: mild, 14-20: moderate, 21-27: moderately severe, 28+: severe)
    - Anxiety Score: (0-4: minimal, 5-9: mild, 10-14: moderate, 15+: severe)
    - Overall Wellness Score: (0-8: excellent, 9-16: good, 17-24: moderate concerns, 25-32: significant concerns, 33-40: severe concerns)

    **Evaluation Task:**
    1. Analyze the 'New Status' (emoji and diary) for positive progress, self-care, and mood improvement, or, conversely, signs of stress, regression, or negative coping.
    2. Calculate a new score for Depression, Anxiety, and Overall Wellness based on the change described. **Scores must be integers.**
    3. Provide a single, short summary (1-2 sentences) of the user's current emotional state and the general direction of the change.
`;

export async function calculateNewScore(profile: any, status: any) {
    const prompt = `
        // --- USER DATA FOR EVALUATION ---
        **Current Scores (Starting Point):**
        - Depression: ${profile.depression}
        - Anxiety: ${profile.anxiety}
        - Overall Wellness: ${profile.overall}

        **New Status Update:**
        - Today's status: ${status.emoji}
        - Diary Entry: "${status.diary}"

        **REQUIRED ACTION:** Using the Scoring Guide provided, analyze the New Status Update in context of the Current Scores and generate the three NEW, updated scores with a single. short summary of the emotional status.
    `;

    try {
        const response = await scoreAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: scoreSchema,
                temperature: 0.5,
                systemInstruction: SCORING_GUIDE,
            }
        });
        // console.log("AI Plan Response Text:\n", response.text?.trim());

        // Parse the JSON string from the response text and return the object
        if (!response.text) {
            throw new Error("AI response text is empty");
        }
        // console.log("score response: ", response);
        const jsonStr = response.text.trim();
        // console.log("Score: ", jsonStr);
        return JSON.parse(jsonStr);

    } catch (error) {
        console.log("Error evaluating new updated status:", error);
        return mockScore;
        // throw error;
    }
}