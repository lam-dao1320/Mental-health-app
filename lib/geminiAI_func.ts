import { ai, quickStressActivitiesSchema } from "./geminiAI";

export async function suggestQuickActivities(status: string) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Today I am feeling ${status}. You are an AI Wellness Coach. Suggest 3 distinct categories of stress-relief activities suitable for someone who has 10 minutes, is at their desk, and needs a non-disruptive activity. For each category, provide 3 specific activities with instructions and a helpful resource link.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: quickStressActivitiesSchema,
                temperature: 0.7,
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
