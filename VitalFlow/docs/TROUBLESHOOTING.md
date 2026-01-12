# 🔧 VitalFlow Troubleshooting Guide

## Common Errors & Solutions

### 1. **404 Errors in Server Logs**

#### What You're Seeing:
```
[VitalFlow Server] 404
[VitalFlow Server] GET /favicon.ico HTTP/1.1
[VitalFlow Server] GET /.well-known/appspecific/com.chrome.devtools.json HTTP/1.1
```

#### **Why This Happens:**
These are **harmless browser requests** that can be safely ignored:

- **`/favicon.ico`** - Browser automatically requests the website icon
- **`/.well-known/`** - Chrome DevTools looking for debugging configuration
- Generic 404s without file paths - Usually query parameters or browser extensions

#### **Solution:**
✅ **No action needed!** The updated `server.py` now filters these out.

---

### 2. **CORS Errors in Browser Console**

#### What You Might See:
```
Access to fetch at 'https://orgfarm-...salesforce.com/...' from origin 
'http://localhost:8765' has been blocked by CORS policy
```

#### **Why This Happens:**
Salesforce blocks requests from localhost by default for security.

#### **Solution:**
1. Open Salesforce Setup
2. Search for "CORS" in Quick Find
3. Click **CORS** → **New**
4. Add these URLs:
   - `http://localhost:8765`
   - `https://*.tableau.com`
   - `https://*.tableauusercontent.com`
5. Click **Save**

**How to access Salesforce Setup:**
```bash
sf org open --target-org vitalflow-dev
```
Then click the gear icon ⚙️ (top right) → Setup

---

### 3. **Access Token Expired**

#### What You'll See:
```javascript
Failed to create Hospital Alert: 401 INVALID_SESSION_ID
```

#### **Why This Happens:**
Salesforce access tokens expire after **~2 hours**.

#### **Solution:**
Generate a fresh token:

```bash
sf org display --verbose --target-org vitalflow-dev
```

Copy the **Access Token** value and update `salesforce-api.js`:

```javascript
const SF_CONFIG = {
    instanceUrl: 'https://orgfarm-42c1321b7f-dev-ed.develop.my.salesforce.com',
    accessToken: 'PASTE_NEW_TOKEN_HERE', // ⚠️ Update this!
    apiVersion: 'v65.0'
};
```

**Pro Tip:** Right before your demo, regenerate the token!

---

### 4. **Extension Won't Load in Tableau**

#### What You Might See:
- Extension zone shows "Unable to load extension"
- Browser console shows Tableau Extensions API errors

#### **Why This Happens:**
- Server not running
- Wrong URL in manifest file
- Tableau security settings

#### **Solution:**

**Step 1: Verify Server is Running**
```bash
# You should see:
🏥 VitalFlow Extension Server
🌐 Server URL: http://localhost:8765
```

**Step 2: Test Extension Locally**
Open in browser: http://localhost:8765/index.html

If it loads with the header "VitalFlow - AI Command Center", you're good!

**Step 3: Check Manifest URL**
In `vitalflow.trex`, verify:
```xml
<url>http://localhost:8765/index.html</url>
```

**Step 4: Tableau Cloud Settings**
- Go to Tableau Cloud → Settings → Extensions
- Ensure "Allow extensions to run" is checked
- For development, allow "Network-enabled extensions"

---

### 5. **JavaScript Errors - Tableau Extensions API Not Found**

#### What You'll See in Console:
```
tableau is not defined
```

#### **Why This Happens:**
You're testing the extension **outside of Tableau** (in a regular browser).

#### **Solution:**
✅ **This is expected!** 

The extension **must run inside Tableau** to access the Extensions API.

**For Local Testing:**
1. Create a simple Tableau dashboard
2. Add an Extension object
3. Point it to your `.trex` file
4. The extension will load with full API access

**For Quick UI Testing:**
You can mock the Tableau API by adding this to `app.js` temporarily:

```javascript
// DEVELOPMENT ONLY - Remove before production!
if (!window.tableau) {
    console.warn('⚠️ Running outside Tableau - mocking API');
    window.tableau = {
        extensions: {
            initializeAsync: () => Promise.resolve(),
            dashboardContent: {
                dashboard: {
                    name: 'Mock Dashboard',
                    worksheets: []
                }
            }
        }
    };
}
```

---

### 6. **No Data Showing in Extension**

#### What Happens:
Extension loads but shows "Select a Ward" even after clicking.

#### **Why This Happens:**
- Worksheet name doesn't match the code's expectation
- Ward data fields have different names
- No marks selected

#### **Solution:**

**Step 1: Check Worksheet Name**
In `app.js`, the extension looks for worksheets containing these keywords:
- "hospital"
- "floor"
- "map"
- "ward"

Make sure your Tableau worksheet name includes one of these!

**Step 2: Check Field Names**
The extension expects these fields:
- `Ward_Name` or anything with "ward" + "name"
- `Occupancy_Percent` or "occupancy"
- `Available_Beds` or "available" + "beds"
- `Wait_Time_Minutes` or "wait" + "time"

**Step 3: Enable Debugging**
Open browser console (F12) and check:
```javascript
// See selected ward data
window.VitalFlow.selectedWard()

// See current recommendation
window.VitalFlow.recommendation()
```

---

### 7. **Python Server Won't Start - Port In Use**

#### Error Message:
```
OSError: [WinError 10048] Only one usage of each socket address 
is normally permitted
```

#### **Why This Happens:**
Another program is using port 8765.

#### **Solution:**

**Option A: Kill the Process Using the Port**
```powershell
# Find what's using port 8765
netstat -ano | findstr :8765

# Kill it (replace PID with actual number)
taskkill /PID <PID> /F
```

**Option B: Use a Different Port**
Edit `server.py`:
```python
PORT = 8888  # Or any available port
```

And update `vitalflow.trex`:
```xml
<url>http://localhost:8888/index.html</url>
```

---

## 🧪 Testing Checklist

Before using the extension with Tableau, verify:

### Server Test
- [ ] Server running: http://localhost:8765
- [ ] Extension UI loads: http://localhost:8765/index.html
- [ ] See "VitalFlow - AI Command Center" header
- [ ] See "Select a Ward" message

### Salesforce Test
- [ ] CORS configured for `http://localhost:8765`
- [ ] Access token is fresh (< 2 hours old)
- [ ] Can query alerts:
  ```bash
  sf data query --query "SELECT Id, Name FROM Hospital_Alert__c LIMIT 5" --target-org vitalflow-dev
  ```

### Browser Console Check (F12)
- [ ] No red errors (404s for favicon/well-known are OK)
- [ ] Salesforce API script loaded
- [ ] App.js loaded
- [ ] See message: "🏥 VitalFlow loaded. Debug with window.VitalFlow"

---

## 🆘 Still Having Issues?

### Debug Commands

**1. Test Salesforce Connection in Browser Console:**
```javascript
await window.SalesforceAPI.testConnection()
// Should return: true
```

**2. Manually Create Test Alert:**
```javascript
await window.SalesforceAPI.createHospitalAlert({
    Ward_Name__c: 'Test Ward',
    Action_Type__c: 'Deploy Staff',
    Severity__c: 'High',
    Status__c: 'Pending',
    Occupancy_Percent__c: 95
})
```

**3. Check Extension State:**
```javascript
// Open browser console (F12) in the extension
console.table(window.VitalFlow.selectedWard())
```

---

## 📋 Quick Reference

### Important URLs
- **Extension UI**: http://localhost:8765/index.html
- **Manifest**: http://localhost:8765/vitalflow.trex
- **Salesforce Org**: https://orgfarm-42c1321b7f-dev-ed.develop.my.salesforce.com

### Important Files
- **Server**: `src/extension/server.py`
- **API Config**: `src/extension/salesforce-api.js` (line 15 - access token)
- **Manifest**: `src/extension/vitalflow.trex` (line 10 - server URL)

### Important Commands
```bash
# Refresh access token
sf org display --verbose --target-org vitalflow-dev

# Open Salesforce in browser
sf org open --target-org vitalflow-dev

# Query hospital alerts
sf data query --query "SELECT Id, Name, Ward_Name__c FROM Hospital_Alert__c" --target-org vitalflow-dev

# Start dev server
cd "w:\tablueau hackathon\VitalFlow\src\extension"
python server.py
```

---

## ✅ Everything Working?

You should see:
1. ✅ Server running without errors
2. ✅ Extension UI loads in browser
3. ✅ Browser console shows no CORS errors
4. ✅ Salesforce connection test returns `true`
5. ✅ Can manually create alerts via console

**Next:** Set up your Tableau dashboard and add the extension!

---

**Last Updated:** January 12, 2026
