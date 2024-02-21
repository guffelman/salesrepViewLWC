import { LightningElement, wire, api } from 'lwc';
import { getRecord, getFieldValue, createRecord } from 'lightning/uiRecordApi'; // Added createRecord
import USER_ID from '@salesforce/user/Id';
import PROFILE_NAME_FIELD from '@salesforce/schema/User.Profile.Name';
import USER_NAME from '@salesforce/schema/User.Name';
import CASE_SALES_REP_VIEW_OBJECT from '@salesforce/schema/Case_Sales_Rep_View__c';
import USER_FIELD from '@salesforce/schema/Case_Sales_Rep_View__c.User__c';
import CASE_FIELD from '@salesforce/schema/Case_Sales_Rep_View__c.Case__c';
import DEVICE_FIELD from '@salesforce/schema/Case_Sales_Rep_View__c.Device__c';
import NAME_FIELD from '@salesforce/schema/Case_Sales_Rep_View__c.Name';
export default class SalesrepViewLWC extends LightningElement {
    @api recordId; // This will hold the ID of the Case record
    profile;
    username;

    // Wire method to get the running user's profile information
    @wire(getRecord, { recordId: USER_ID, fields: [PROFILE_NAME_FIELD, USER_NAME] })
    wiredUser({ error, data }) {
        if (data) {
            this.profile = getFieldValue(data, PROFILE_NAME_FIELD);
            this.username = getFieldValue(data, USER_NAME);
        } else if (error) {
            console.error('Error retrieving user profile', JSON.stringify(error));
        }
    }

    connectedCallback() {
        this.wiredUserPromise = new Promise((resolve, reject) => {
            if (this.profile) {
                resolve();
            } else {
                reject('Error: Profile not loaded');
            }
        });

        this.wiredUserPromise
            .then(() => {
                if (this.profile === 'System Administrator') {
                    this.updateSalesRepViewedDate();
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    // Update the embedded record's "Sales_Rep_View_Date__c" field with the current date
    updateSalesRepViewedDate() {
        const fields = {};
        fields[USER_FIELD.fieldApiName] = USER_ID; // Set the User__c field to the current user's ID
        fields[CASE_FIELD.fieldApiName] = this.recordId; // Set the Case__c field to the ID of the Case record
        // set the Device__c field to the current device - picklist options 'Mobile', 'Desktop'.
        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|webOS|BlackBerry|Windows Phone)/)) {
            fields[DEVICE_FIELD.fieldApiName] = 'Mobile';
        }
        else {
            fields[DEVICE_FIELD.fieldApiName] = 'Desktop';
        }
        fields[NAME_FIELD.fieldApiName] = this.username;


        const recordInput = { apiName: CASE_SALES_REP_VIEW_OBJECT.objectApiName, fields };
    
        createRecord(recordInput)
            .then(record => {
                console.log('Record created', record.id);
            })
            .catch(error => {
                console.error('Error creating record', JSON.stringify(error));
            });
    }

    get userProfile(){
        return this.profile;
    }

}