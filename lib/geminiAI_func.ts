import { activitiesSchema, activityAI, planAI, plansSchema, scoreAI, scoreSchema } from "./geminiAI";

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
        const jsonStr = response.text.trim();
        return jsonStr;

    } catch (error) {
        console.error("Error generating activity suggestions:", error);
        throw error;
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
            throw new Error("AI response text is empty");
        }
        const jsonStr = response.text.trim();
        return jsonStr;

    } catch (error) {
        console.error("Error generating wellness plans:", error);
        throw error;
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
        const jsonStr = response.text.trim();
        return jsonStr;

    } catch (error) {
        console.error("Error evaluating new updated status:", error);
        throw error;
    }
}