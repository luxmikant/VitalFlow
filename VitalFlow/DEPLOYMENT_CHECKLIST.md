# 🚀 VitalFlow Deployment Checklist

**Use this checklist before demo day to ensure everything is production-ready.**

---

## 📅 Timeline: Day Before Demo

### Morning (9:00 AM - 12:00 PM)

#### Salesforce Environment
- [ ] Log into Salesforce Developer Org
- [ ] Verify Custom Object `Hospital_Alert__c` exists
- [ ] Check field-level security (all fields accessible)
- [ ] Verify Connected App is active
- [ ] Test OAuth flow manually in Postman
- [ ] Verify CORS settings include production URL
- [ ] Test Flow automation (create record → verify email sent)
- [ ] Clear all test records from Hospital Alerts

#### Tableau Cloud
- [ ] Log into Tableau Cloud
- [ ] Open VitalFlow dashboard
- [ ] Verify data source is connected
- [ ] Refresh data extract
- [ ] Check visualization renders correctly
- [ ] Verify filters work
- [ ] Test dashboard on mobile/tablet view
- [ ] Share dashboard with team members

#### Extension Hosting
- [ ] Verify production URL is accessible: `curl -I [your-url]`
- [ ] Check HTTPS certificate is valid
- [ ] Test all files load (index.html, app.js, styles.css)
- [ ] Verify no console errors in browser dev tools
- [ ] Check SLDS CSS loads correctly
- [ ] Test on Chrome, Firefox, Safari

---

### Afternoon (1:00 PM - 5:00 PM)

#### Integration Testing
- [ ] Generate fresh OAuth access token (valid for 2+ hours):
  ```bash
  sf org display --verbose --target-org vitalflow-dev
  ```
- [ ] Update `app.js` with new token
- [ ] Load extension in Tableau Cloud
- [ ] **End-to-End Test #1:**
  - [ ] Select Emergency Room (red ward)
  - [ ] Verify AI recommendation appears
  - [ ] Click "Execute" button
  - [ ] Verify success message < 2 seconds
  - [ ] Check Salesforce record created
  - [ ] Check email received
- [ ] **End-to-End Test #2:**
  - [ ] Select Ward B (green ward)
  - [ ] Verify different recommendation
  - [ ] Execute action
  - [ ] Verify record and email
- [ ] **End-to-End Test #3:**
  - [ ] Repeat with Ward C
  - [ ] Verify no errors

#### Performance Check
- [ ] Open browser DevTools → Network tab
- [ ] Execute action and measure API response time
- [ ] Target: < 2000ms
- [ ] If > 2000ms, investigate bottlenecks
- [ ] Check Salesforce API rate limits (should be well under limit)

#### Demo Data Preparation
- [ ] Update `hospital_data.csv` with dramatic scenario:
  ```csv
  Ward_ID,Ward_Name,Occupancy_Percent,Available_Beds,Total_Beds,Wait_Time_Minutes,Status,Last_Updated
  ER01,Emergency Room,135,0,20,240,Critical,2026-01-12 14:30:00
  ICU01,Intensive Care Unit,75,3,12,0,Normal,2026-01-12 14:30:00
  WA01,Ward A,60,8,20,0,Normal,2026-01-12 14:30:00
  ```
- [ ] Upload fresh data to Tableau Cloud
- [ ] Refresh extract
- [ ] Verify ER shows in RED

---

### Evening (6:00 PM - 8:00 PM)

#### Backup Plans
- [ ] Record full demo video (3 minutes):
  - [ ] Use OBS Studio or Loom
  - [ ] Include voiceover
  - [ ] Show entire workflow
  - [ ] Upload to YouTube (unlisted)
  - [ ] Test video plays smoothly
- [ ] Take screenshots of each step:
  - [ ] Dashboard overview
  - [ ] Ward selection
  - [ ] AI recommendation panel
  - [ ] Success message
  - [ ] Salesforce record
  - [ ] Email notification
- [ ] Create offline demo mode (optional):
  - [ ] Mock Salesforce API with setTimeout()
  - [ ] Fake success responses
  - [ ] Toggle via `DEBUG_MODE` flag

#### Presentation Materials
- [ ] Finalize slides (7-8 slides max)
- [ ] Export to PDF
- [ ] Load on USB drive (backup)
- [ ] Print hard copy of slides
- [ ] Print demo script
- [ ] Test slides on external monitor

---

## 📅 Demo Day Morning

### 2 Hours Before Demo

#### Final Checks
- [ ] Charge laptop to 100%
- [ ] Pack charger
- [ ] Verify WiFi credentials for venue
- [ ] Connect to venue WiFi
- [ ] Test internet speed: [speedtest.net](https://speedtest.net)
- [ ] Clear browser cache
- [ ] Close all unnecessary apps/tabs
- [ ] Disable notifications (Focus Mode)

#### Credentials Verification
- [ ] Salesforce login works
- [ ] Tableau Cloud login works
- [ ] Extension loads without errors
- [ ] OAuth token is fresh (generate new one if needed)

#### Final Integration Test
- [ ] Open Tableau Cloud dashboard
- [ ] Complete full user flow:
  1. Select ER ward
  2. See recommendation
  3. Execute action
  4. Verify Salesforce record
  5. Check email inbox
- [ ] If ANY step fails, switch to backup video

---

### 30 Minutes Before Demo

#### Ready State
- [ ] Salesforce tab open and logged in
- [ ] Tableau Cloud dashboard open in another tab
- [ ] Extension loaded and ready
- [ ] Backup video loaded (paused)
- [ ] Presentation slides open
- [ ] Demo script printed and reviewed
- [ ] Water bottle ready 💧
- [ ] Deep breath 🧘

---

## 🎯 During Demo (3 Minutes)

### Script Timing
- **0:00 - 0:15** - Problem Statement
  - [ ] "Hospitals suffer from Data-Action Gap"
  - [ ] Show busy admin juggling tools
- **0:15 - 0:30** - Solution Introduction
  - [ ] "VitalFlow closes the loop"
  - [ ] Show architecture diagram
- **0:30 - 2:00** - Live Demo
  - [ ] Show dashboard with critical ER
  - [ ] Click ER ward
  - [ ] Show AI recommendation
  - [ ] Execute action (wait for success)
  - [ ] Show email notification
- **2:00 - 2:30** - Technical Innovation
  - [ ] Highlight Tableau Extensions API
  - [ ] Highlight Salesforce integration
- **2:30 - 3:00** - Impact & Future
  - [ ] Real-world applications
  - [ ] Agentforce roadmap
  - [ ] Thank you + Q&A

---

## 🆘 Emergency Procedures

### If Extension Doesn't Load
1. Check browser console for errors
2. Verify CORS settings in Salesforce
3. Try clearing cache and reloading
4. **Fallback:** Switch to recorded video

### If OAuth Token Expired
1. Open terminal
2. Run: `sf org display --verbose --target-org vitalflow-dev`
3. Copy new token
4. Update `app.js`
5. Reload extension
6. **Time estimate:** 2 minutes

### If API Call Fails
1. Check network tab for error details
2. Verify Salesforce org is accessible
3. Check API rate limits
4. **Fallback:** Use mock API mode (if implemented)

### If Email Doesn't Send
1. Check Flow is activated
2. Verify user email is valid
3. Check spam folder
4. **Workaround:** Show Salesforce record instead

---

## ✅ Post-Demo

### Immediate (Within 5 Minutes)
- [ ] Thank judges/audience
- [ ] Collect feedback
- [ ] Note any questions you couldn't answer
- [ ] Exchange contacts with interested people

### Within 24 Hours
- [ ] Upload demo video to submission platform
- [ ] Submit project repository
- [ ] Write post-mortem notes
- [ ] Send thank-you emails to team

### Within 1 Week
- [ ] Clean up code for public release
- [ ] Add comprehensive README
- [ ] Tag stable version: `v1.0.0`
- [ ] Share on LinkedIn/Twitter
- [ ] Submit to Tableau Extension Gallery

---

## 🎉 Success Criteria

### Demo Success (Must Have)
- ✅ Dashboard loads and displays correctly
- ✅ Extension loads without errors
- ✅ User can select a ward
- ✅ AI recommendation appears
- ✅ Execute action creates Salesforce record
- ✅ Confirmation message shows

### Wow Factor (Nice to Have)
- ✅ API response < 2 seconds
- ✅ Email notification sent
- ✅ Smooth, polished UI
- ✅ No technical glitches
- ✅ Confident delivery

---

**Remember:** The judges want to see innovation, not perfection. If something breaks, explain what was supposed to happen and move on. Your passion and problem-solving matter more than flawless execution.

**You've got this! 🚀**
