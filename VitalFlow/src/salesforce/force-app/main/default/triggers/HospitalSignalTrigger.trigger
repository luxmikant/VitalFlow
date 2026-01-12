trigger HospitalSignalTrigger on Hospital_Signal__e (after insert) {
    List<Hospital_Alert__c> alertsToCreate = new List<Hospital_Alert__c>();
    
    for (Hospital_Signal__e signal : Trigger.New) {
        Hospital_Alert__c alert = new Hospital_Alert__c();
        alert.Ward_Name__c = signal.Ward_Name__c;
        alert.Status__c = 'Pending';
        alert.Severity__c = signal.Severity__c != null ? signal.Severity__c : 'High'; // Use signal severity or default
        alert.Occupancy_Percent__c = 90; // Default simulated value
        alert.Wait_Time_Minutes__c = 45; // Default simulated value
        alert.Action_Type__c = 'Capacity Overflow';
        
        // 🤖 AGENTIC INTEGRATION
        // The trigger consults the Agent Logic class to determine the best course of action
        alert.AI_Recommendation__c = AgentLogic.getRecommendation(alert.Ward_Name__c, alert.Severity__c);
        
        alertsToCreate.add(alert);
    }
    
    if (!alertsToCreate.isEmpty()) {
        insert alertsToCreate;
    }
}
