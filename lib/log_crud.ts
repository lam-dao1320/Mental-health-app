import { QuestionnaireLog } from "./object_types";
import { supabase } from "./supabase";

export async function addQuestionnaireLog(newRecord: QuestionnaireLog) {
    const { data, error } = await supabase
            .from('questionnaire_log')
            .insert(newRecord)
        if (error) {
            throw error;
        }
        return data;
}