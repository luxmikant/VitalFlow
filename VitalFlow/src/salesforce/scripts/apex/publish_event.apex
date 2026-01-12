Hospital_Signal__e signal = new Hospital_Signal__e(
    Ward_Name__c = 'Emergency'
);
Database.SaveResult sr = EventBus.publish(signal);

if (sr.isSuccess()) {
    System.debug('Successfully published event.');
} else {
    for(Database.Error err : sr.getErrors()) {
        System.debug('Error returned: ' + err.getStatusCode() + ' - ' + err.getMessage());
    }
}
