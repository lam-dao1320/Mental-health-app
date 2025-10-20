import { activitiesSchema, activityAI } from "./geminiAI";

export async function suggestActivities(status: string) {
    // Construct the prompt for the AI model
    const prompt = 
        `${status}. You are an AI Wellness Coach.
        Your goal is to suggest 5 distinct categories of stress-relief activities suitable for someone who has 30 minutes, is at their desk, and needs a non-disruptive activity.
        For each category, provide 3 specific activities with instructions and a helpful resource link.`;

    console.log("AI Activity Suggestion Prompt:", prompt);

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
        console.log("AI Response Text:", response.text?.trim());
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
