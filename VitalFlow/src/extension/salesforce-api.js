/**
 * VitalFlow Command Center - Salesforce API Integration
 * Handles all communication with Salesforce REST API
 */

// ============================================
// ⚠️ CONFIGURATION - UPDATE THESE VALUES
// ============================================
const SF_CONFIG = {
    // Your Salesforce Instance URL (from sf org display)
    instanceUrl: 'https://orgfarm-42c1321b7f-dev-ed.develop.my.salesforce.com',
    
    // Access Token - Generate fresh one with: sf org display --verbose --target-org vitalflow-dev
    // ⚠️ Tokens expire in ~2 hours! Regenerate before demo!
    accessToken: 'your-access-token',
    
    // API Version
    apiVersion: 'v65.0'
};

// ============================================
// API ENDPOINTS
// ============================================
const ENDPOINTS = {
    hospitalAlert: () => `${SF_CONFIG.instanceUrl}/services/data/${SF_CONFIG.apiVersion}/sobjects/Hospital_Alert__c`,
    query: () => `${SF_CONFIG.instanceUrl}/services/data/${SF_CONFIG.apiVersion}/query/`,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get standard headers for Salesforce API calls
 */
function getHeaders() {
    return {
        'Authorization': `Bearer ${SF_CONFIG.accessToken}`,
        'Content-Type': 'application/json'
    };
}

/**
 * Handle API response and throw error if not ok
 */
async function handleResponse(response) {
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = errorBody[0]?.message || errorBody.message || `HTTP ${response.status}`;
        throw new Error(errorMessage);
    }
    return response.json();
}

// ============================================
// SALESFORCE API FUNCTIONS
// ============================================

/**
 * Creates a new Hospital Alert record in Salesforce
 * @param {Object} alertData - The alert data
 * @param {string} alertData.Ward_Name__c - Name of the ward
 * @param {string} alertData.Action_Type__c - Type of action (Deploy Staff, Divert Ambulance, etc.)
 * @param {string} alertData.Severity__c - Severity level (Low, Medium, High, Critical)
 * @param {number} alertData.Occupancy_Percent__c - Current occupancy percentage
 * @param {string} alertData.Status__c - Status (Pending, In Progress, Completed, Cancelled)
 * @param {number} [alertData.Available_Beds__c] - Number of available beds
 * @param {number} [alertData.Wait_Time_Minutes__c] - Wait time in minutes
 * @param {string} [alertData.AI_Recommendation__c] - AI-generated recommendation text
 * @returns {Promise<Object>} - Created record response with id
 */
async function createHospitalAlert(alertData) {
    console.log('📡 Creating Hospital Alert:', alertData);
    
    // Add timestamp
    const payload = {
        ...alertData,
        Action_Timestamp__c: new Date().toISOString()
    };
    
    try {
        const response = await fetch(ENDPOINTS.hospitalAlert(), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        
        const result = await handleResponse(response);
        console.log('✅ Hospital Alert created:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Failed to create Hospital Alert:', error);
        throw error;
    }
}

/**
 * Query Hospital Alerts from Salesforce
 * @param {string} [whereClause] - Optional WHERE clause for filtering
 * @returns {Promise<Object>} - Query results
 */
async function queryHospitalAlerts(whereClause = '') {
    const soql = `SELECT Id, Name, Ward_Name__c, Action_Type__c, Severity__c, 
                  Occupancy_Percent__c, Status__c, Available_Beds__c, 
                  Wait_Time_Minutes__c, AI_Recommendation__c, CreatedDate
                  FROM Hospital_Alert__c 
                  ${whereClause} 
                  ORDER BY CreatedDate DESC 
                  LIMIT 10`;
    
    const encodedQuery = encodeURIComponent(soql);
    
    try {
        const response = await fetch(`${ENDPOINTS.query()}?q=${encodedQuery}`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        return await handleResponse(response);
        
    } catch (error) {
        console.error('❌ Failed to query Hospital Alerts:', error);
        throw error;
    }
}

/**
 * Test the Salesforce connection
 * @returns {Promise<boolean>} - True if connection successful
 */
async function testConnection() {
    try {
        const response = await fetch(
            `${SF_CONFIG.instanceUrl}/services/data/${SF_CONFIG.apiVersion}/sobjects/Hospital_Alert__c/describe`,
            {
                method: 'GET',
                headers: getHeaders()
            }
        );
        
        if (response.ok) {
            console.log('✅ Salesforce connection successful');
            return true;
        } else {
            console.error('❌ Salesforce connection failed:', response.status);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Salesforce connection error:', error);
        return false;
    }
}

/**
 * Update the access token (call this with a fresh token)
 * @param {string} newToken - New access token
 */
function updateAccessToken(newToken) {
    SF_CONFIG.accessToken = newToken;
    console.log('🔑 Access token updated');
}

// ============================================
// EXPORTS (for use in app.js)
// ============================================
window.SalesforceAPI = {
    createHospitalAlert,
    queryHospitalAlerts,
    testConnection,
    updateAccessToken,
    config: SF_CONFIG
};
