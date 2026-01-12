import { LightningElement, wire, track } from 'lwc';
import getRecentAlerts from '@salesforce/apex/HospitalAlertController.getRecentAlerts';
import acknowledgeAlert from '@salesforce/apex/HospitalAlertController.acknowledgeAlert';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class HospitalMonitor extends LightningElement {
    @wire(getRecentAlerts)
    wiredAlerts;

    get alerts() {
        if (this.wiredAlerts.data) {
            return this.wiredAlerts.data.map(alert => ({
                ...alert,
                isAcknowledged: alert.Status__c === 'Acknowledged'
            }));
        }
        return [];
    }
    
    get activeAlertCount() {
        return this.alerts ? this.alerts.length : 0;
    }

    handleAcknowledge(event) {
        const alertId = event.target.dataset.id;
        acknowledgeAlert({ alertId: alertId })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Alert Acknowledged',
                        variant: 'success'
                    })
                );
                return refreshApex(this.wiredAlerts);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error processing alert',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }
}

