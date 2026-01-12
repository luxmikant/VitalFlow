public with sharing class HospitalAlertController {
    @AuraEnabled(cacheable=true)
    public static List<Hospital_Alert__c> getRecentAlerts() {
        return [
            SELECT Id, Name, Ward_Name__c, Severity__c, Status__c, 
                   Occupancy_Percent__c, Wait_Time_Minutes__c, AI_Recommendation__c, CreatedDate
            FROM Hospital_Alert__c
            WHERE Status__c != 'Completed' AND Status__c != 'Cancelled'
            ORDER BY CreatedDate DESC
            LIMIT 50
        ];
    }

    @AuraEnabled
    public static void acknowledgeAlert(String alertId) {
        try {
            Hospital_Alert__c alert = new Hospital_Alert__c(Id = alertId, Status__c = 'Acknowledged');
            update alert;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
