/**
 * VitalFlow Command Center - Main Application Logic
 * Handles Tableau Extensions API integration and UI interactions
 */

// ============================================
// GLOBAL STATE
// ============================================
let selectedWard = null;
let currentRecommendation = null;
let isConnected = false;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the Tableau Extension
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 VitalFlow initializing...');
    
    try {
        // Initialize Tableau Extensions API
        await tableau.extensions.initializeAsync();
        console.log('✅ Tableau Extensions API initialized');
        
        // Update connection status
        updateConnectionStatus(true);
        
        // Setup event listeners for worksheet selection changes
        setupEventListeners();
        
        // Test Salesforce connection
        const sfConnected = await SalesforceAPI.testConnection();
        if (!sfConnected) {
            showError('Salesforce connection failed. Please check your access token.');
        }
        
        // Show empty state (waiting for selection)
        showEmptyState();
        
    } catch (error) {
        console.error('❌ Failed to initialize extension:', error);
        updateConnectionStatus(false);
        showError('Failed to initialize extension: ' + error.message);
    }
});

// ============================================
// TABLEAU INTEGRATION
// ============================================

/**
 * Setup event listeners for Tableau worksheet interactions
 */
function setupEventListeners() {
    const dashboard = tableau.extensions.dashboardContent.dashboard;
    
    console.log('📊 Dashboard:', dashboard.name);
    console.log('📋 Worksheets:', dashboard.worksheets.map(ws => ws.name));
    
    // Find the Hospital Floor Map worksheet
    const worksheet = dashboard.worksheets.find(ws => 
        ws.name.toLowerCase().includes('hospital') || 
        ws.name.toLowerCase().includes('floor') ||
        ws.name.toLowerCase().includes('map') ||
        ws.name.toLowerCase().includes('ward')
    );
    
    if (worksheet) {
        console.log('🎯 Found worksheet:', worksheet.name);
        
        // Listen for mark selection changes
        worksheet.addEventListener(
            tableau.TableauEventType.MarkSelectionChanged,
            handleMarkSelection
        );
        
        console.log('✅ Event listener attached');
    } else {
        console.warn('⚠️ No matching worksheet found. Available:', dashboard.worksheets.map(ws => ws.name));
        // Attach to first worksheet as fallback
        if (dashboard.worksheets.length > 0) {
            const firstWorksheet = dashboard.worksheets[0];
            firstWorksheet.addEventListener(
                tableau.TableauEventType.MarkSelectionChanged,
                handleMarkSelection
            );
            console.log('🔄 Attached to fallback worksheet:', firstWorksheet.name);
        }
    }
}

/**
 * Handle mark selection changes in the worksheet
 */
async function handleMarkSelection(event) {
    console.log('🖱️ Mark selection changed');
    
    try {
        const marksCollection = await event.getMarksAsync();
        
        if (marksCollection.data.length === 0 || marksCollection.data[0].data.length === 0) {
            console.log('ℹ️ No marks selected');
            showEmptyState();
            return;
        }
        
        // Get the selected data
        const marks = marksCollection.data[0];
        const columns = marks.columns;
        const firstRow = marks.data[0];
        
        console.log('📋 Columns:', columns.map(c => c.fieldName));
        console.log('📋 Data:', firstRow);
        
        // Extract ward data from the selection
        const wardData = extractWardData(columns, firstRow);
        
        if (wardData) {
            selectedWard = wardData;
            console.log('🏥 Ward selected:', wardData);
            
            // Generate AI recommendation
            currentRecommendation = generateRecommendation(wardData);
            
            // Update UI
            showWardPanel(wardData, currentRecommendation);
        } else {
            console.warn('⚠️ Could not extract ward data');
            showEmptyState();
        }
        
    } catch (error) {
        console.error('❌ Error handling selection:', error);
        showError('Error processing selection: ' + error.message);
    }
}

/**
 * Extract ward data from Tableau selection
 */
function extractWardData(columns, row) {
    const data = {};
    
    // Map columns to data
    columns.forEach((col, index) => {
        const fieldName = col.fieldName.toLowerCase();
        const value = row[index].formattedValue || row[index].value;
        
        if (fieldName.includes('ward') && fieldName.includes('name')) {
            data.name = value;
        } else if (fieldName.includes('occupancy') || fieldName.includes('percent')) {
            data.occupancy = parseFloat(value) || 0;
        } else if (fieldName.includes('available') || fieldName.includes('beds')) {
            data.availableBeds = parseInt(value) || 0;
        } else if (fieldName.includes('wait') || fieldName.includes('time')) {
            data.waitTime = parseInt(value) || 0;
        } else if (fieldName.includes('status')) {
            data.status = value;
        } else if (fieldName.includes('total')) {
            data.totalBeds = parseInt(value) || 0;
        }
    });
    
    // If we got ward name from any field, use it
    if (!data.name) {
        // Try to find any field that looks like a name
        columns.forEach((col, index) => {
            if (col.fieldName.toLowerCase().includes('name') || 
                col.fieldName.toLowerCase().includes('ward')) {
                data.name = row[index].formattedValue || row[index].value;
            }
        });
    }
    
    // Determine severity from occupancy if not provided
    if (data.occupancy !== undefined) {
        if (data.occupancy > 100) data.severity = 'Critical';
        else if (data.occupancy > 90) data.severity = 'High';
        else if (data.occupancy > 75) data.severity = 'Medium';
        else data.severity = 'Normal';
    }
    
    return data.name ? data : null;
}

// ============================================
// AI RECOMMENDATION ENGINE
// ============================================

/**
 * Generate AI-powered recommendation based on ward data
 */
function generateRecommendation(wardData) {
    const { name, occupancy, availableBeds, waitTime, severity } = wardData;
    
    let action = '';
    let reason = '';
    let priority = severity || 'Normal';
    
    // Critical: Over 100% capacity
    if (occupancy > 100) {
        if (name.toLowerCase().includes('emergency') || name.toLowerCase().includes('er')) {
            action = 'Divert Ambulance';
            reason = `${name} is at ${occupancy}% capacity - critically overcrowded. Incoming ambulances should be diverted to nearby facilities.`;
        } else {
            action = 'Deploy Staff';
            reason = `${name} is at ${occupancy}% capacity. Deploy additional staff and prepare for patient transfers to lower-capacity wards.`;
        }
        priority = 'Critical';
    }
    // High: 90-100% capacity
    else if (occupancy > 90) {
        action = 'Deploy Staff';
        reason = `${name} approaching critical capacity at ${occupancy}%. Deploying additional nurses to manage patient flow.`;
        priority = 'High';
    }
    // Medium: 75-90% capacity
    else if (occupancy > 75) {
        action = 'Request Equipment';
        reason = `${name} at ${occupancy}% capacity. Pre-staging additional equipment recommended.`;
        priority = 'Medium';
    }
    // Check wait time
    else if (waitTime > 60) {
        action = 'Deploy Staff';
        reason = `Wait time in ${name} is ${waitTime} minutes. Additional staff needed to reduce patient wait times.`;
        priority = 'Medium';
    }
    // Normal
    else {
        action = 'No Action Required';
        reason = `${name} operating within normal parameters. Occupancy: ${occupancy}%, Available beds: ${availableBeds}.`;
        priority = 'Normal';
    }
    
    return {
        action,
        reason,
        priority,
        timestamp: new Date().toISOString()
    };
}

// ============================================
// UI FUNCTIONS
// ============================================

/**
 * Update connection status indicator
 */
function updateConnectionStatus(connected) {
    isConnected = connected;
    const indicator = document.getElementById('status-indicator');
    
    if (connected) {
        indicator.className = 'status-badge status-connected';
        indicator.querySelector('.status-text').textContent = 'Connected';
    } else {
        indicator.className = 'status-badge status-disconnected';
        indicator.querySelector('.status-text').textContent = 'Disconnected';
    }
}

/**
 * Show loading state
 */
function showLoading() {
    document.getElementById('loading-state').style.display = 'flex';
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('ward-panel').style.display = 'none';
    document.getElementById('success-panel').style.display = 'none';
}

/**
 * Show empty state (no selection)
 */
function showEmptyState() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('empty-state').style.display = 'block';
    document.getElementById('ward-panel').style.display = 'none';
    document.getElementById('success-panel').style.display = 'none';
    
    selectedWard = null;
    currentRecommendation = null;
}

/**
 * Show ward panel with data and recommendation
 */
function showWardPanel(wardData, recommendation) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('ward-panel').style.display = 'block';
    document.getElementById('success-panel').style.display = 'none';
    
    // Update ward name
    document.getElementById('ward-name').textContent = wardData.name;
    
    // Update severity badge
    const severityBadge = document.getElementById('severity-badge');
    severityBadge.textContent = recommendation.priority;
    severityBadge.className = `slds-badge severity-${recommendation.priority.toLowerCase()}`;
    
    // Update stats
    document.getElementById('stat-occupancy').textContent = `${wardData.occupancy || '--'}%`;
    document.getElementById('stat-beds').textContent = wardData.availableBeds ?? '--';
    document.getElementById('stat-wait').textContent = wardData.waitTime ? `${wardData.waitTime} min` : '--';
    document.getElementById('stat-status').textContent = wardData.status || recommendation.priority;
    
    // Update AI recommendation
    document.getElementById('ai-text').textContent = recommendation.reason;
    document.getElementById('suggested-action').textContent = recommendation.action;
    
    // Update action button state
    const executeBtn = document.getElementById('btn-execute');
    if (recommendation.action === 'No Action Required') {
        executeBtn.disabled = true;
        executeBtn.classList.add('slds-button_disabled');
    } else {
        executeBtn.disabled = false;
        executeBtn.classList.remove('slds-button_disabled');
    }
    
    // Color-code the panel based on severity
    const panel = document.getElementById('ward-panel');
    panel.className = `slds-card severity-panel-${recommendation.priority.toLowerCase()}`;
}

/**
 * Show success panel
 */
function showSuccessPanel(recordId, message) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('ward-panel').style.display = 'none';
    document.getElementById('success-panel').style.display = 'block';
    
    document.getElementById('success-message').textContent = message;
    document.getElementById('record-id').textContent = `Record ID: ${recordId}`;
}

/**
 * Show error toast
 */
function showError(message) {
    const toast = document.getElementById('error-toast');
    document.getElementById('error-message').textContent = message;
    toast.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => hideError(), 5000);
}

/**
 * Hide error toast
 */
function hideError() {
    document.getElementById('error-toast').style.display = 'none';
}

/**
 * Reset panel to empty state
 */
function resetPanel() {
    showEmptyState();
}

/**
 * Dismiss current recommendation
 */
function dismissRecommendation() {
    showEmptyState();
}

// ============================================
// ACTION HANDLERS
// ============================================

/**
 * Execute the recommended action
 */
async function handleExecuteAction() {
    if (!selectedWard || !currentRecommendation) {
        showError('No ward selected');
        return;
    }
    
    console.log('🚀 Executing action:', currentRecommendation.action);
    
    // Show loading state on button
    const executeBtn = document.getElementById('btn-execute');
    const originalText = executeBtn.innerHTML;
    executeBtn.innerHTML = `
        <div role="status" class="slds-spinner slds-spinner_x-small slds-spinner_inline">
            <span class="slds-assistive-text">Loading</span>
            <div class="slds-spinner__dot-a"></div>
            <div class="slds-spinner__dot-b"></div>
        </div>
        <span class="slds-m-left_x-small">Processing...</span>
    `;
    executeBtn.disabled = true;
    
    try {
        // Create alert in Salesforce
        const alertData = {
            Ward_Name__c: selectedWard.name,
            Action_Type__c: currentRecommendation.action,
            Severity__c: currentRecommendation.priority,
            Occupancy_Percent__c: selectedWard.occupancy || 0,
            Available_Beds__c: selectedWard.availableBeds || 0,
            Wait_Time_Minutes__c: selectedWard.waitTime || 0,
            Status__c: 'Pending',
            AI_Recommendation__c: currentRecommendation.reason
        };
        
        const result = await SalesforceAPI.createHospitalAlert(alertData);
        
        console.log('✅ Alert created successfully:', result.id);
        
        // Show success panel
        const successMessage = `${currentRecommendation.action} for ${selectedWard.name} has been initiated. Notifications sent to assigned staff.`;
        showSuccessPanel(result.id, successMessage);
        
    } catch (error) {
        console.error('❌ Failed to execute action:', error);
        showError('Failed to execute action: ' + error.message);
        
        // Reset button
        executeBtn.innerHTML = originalText;
        executeBtn.disabled = false;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format percentage with color
 */
function formatOccupancy(percent) {
    if (percent > 100) return `<span class="text-critical">${percent}%</span>`;
    if (percent > 90) return `<span class="text-high">${percent}%</span>`;
    if (percent > 75) return `<span class="text-medium">${percent}%</span>`;
    return `<span class="text-normal">${percent}%</span>`;
}

// Expose for debugging in console
window.VitalFlow = {
    selectedWard: () => selectedWard,
    recommendation: () => currentRecommendation,
    testConnection: () => SalesforceAPI.testConnection(),
    createTestAlert: () => handleExecuteAction()
};

console.log('🏥 VitalFlow loaded. Debug with window.VitalFlow');
