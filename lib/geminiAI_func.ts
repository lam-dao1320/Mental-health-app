import { activitiesSchema, activityAI, planAI, plansSchema } from "./geminiAI";

export async function suggestActivities(status: string) {
    // Construct the prompt for the AI model
    const prompt = 
       `${status}. You are an AI Wellness Coach.
        Your goal is to first **select the single most suitable category** of stress-relief activity for the user's current status, given they have 30 minutes, are at their desk, and needs a non-disruptive activity.
        Then, list 5 specific activities that fit this single chosen category. 
        For each activity, provide its **name**, brief instructions, and a helpful resource link.`;

    console.log("AI Activity Suggestion Prompt:\n", prompt);

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
        console.log("AI Response Text:\n", response.text?.trim());

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
const SCORING_GUIDE = `
  You are an AI Wellness Consultant and Action Planner. Analyze user scores based on these scales:
  - Depression Score: (0-4: minimal, 7-13: mild, 14-20: moderate, 21-27: moderately severe, 28+: severe)
  - Anxiety Score: (0-4: minimal, 5-9: mild, 10-14: moderate, 15+: severe)
  - Overall Wellness Score: (0-8: excellent, 9-16: good, 17-24: moderate concerns, 25-32: significant concerns, 33-40: severe concerns)
  
  Your task is to generate a personalized three-part action plan for stress reduction.
`;

export async function suggestPlans(profile: any) {
    // Construct the dynamic part of the prompt
    const prompt = `
        Generate a self-managed action plan consisting of **FIVE (5)** high-impact activities.
        
        Use the following five activity types exactly once:
        1. **Nature/Movement**
        2. **Mind/Creative**
        3. **Social/Reset**
        4. **Skill Acquisition** (Suggest learning a small, engaging skill)
        5. **Digital Detox/Focus** (Suggest an activity to disconnect from technology)

        The plan should address the user's current scores:
        - Depression: ${profile.depression}
        - Anxiety: ${profile.anxiety}
        - Overall Wellness: ${profile.overall}

        The activities suggested (e.g., 'traveling', 'camping', 'pottery') must be holistic experiences that require planning.

        **CRITICAL INSTRUCTION:** For each of the five activities, include a 2-3 sentence description in the 'details' field explaining what the activity involves and how to get started. Ensure the output strictly follows the provided JSON schema.
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
        console.error("Error generating wellness plans:", error);
        throw error;
    }
}
