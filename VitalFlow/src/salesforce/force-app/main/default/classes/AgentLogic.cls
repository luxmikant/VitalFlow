public with sharing class AgentLogic {
    /**
     * Simulates an AI Agent analyzing hospital signals to recommend actions.
     * In a real Enterprise scenario, this would call Agentforce or an LLM via API.
     */
    public static String getRecommendation(String ward, String severity) {
        if (severity == 'Critical') {
            return '⚠️ URGENT: Divert all incoming ambulances to St. Mary\'s. Page ' + ward + ' Chief of Staff immediately.';
        } 
        else if (severity == 'High') {
            return 'Analyze Request: Deploy 2 float nurses from General Ward to ' + ward + '. Monitor vitals closer.';
        }
        else if (ward == 'Emergency') {
            return 'Calculated Wait Time > 4 hrs. Open Overflow Triage Area B.';
        }
        
        return 'Standard Protocol: Continue monitoring occupancy levels.';
    }
}
