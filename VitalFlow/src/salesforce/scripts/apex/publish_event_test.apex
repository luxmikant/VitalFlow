Hospital_Signal__e signal = new Hospital_Signal__e(
    Ward_Name__c = 'IntegrationTest_' + System.currentTimeMillis()
);
Database.SaveResult sr = EventBus.publish(signal);

if (sr.isSuccess()) {
    System.debug('Successfully published event for: ' + signal.Ward_Name__c);
} else {
    System.debug('Error publishing event.');
}
