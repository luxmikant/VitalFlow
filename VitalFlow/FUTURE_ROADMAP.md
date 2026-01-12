# 🚀 VitalFlow: Enterprise Roadmap & Architecture

**Project:** AI-Assisted Hospital Command Center
**Current Version:** 1.0 (MVP)
**Target State:** 2.0 (Enterprise Ecosystem)

---

## 🏗️ 1. Executive Summary

**Current State (MVP):** A functional "Closed Loop" application where a Tableau Extension sends point-to-point alerts to a Salesforce Custom Object via REST API.
**Future State (Enterprise):** A scalable, event-driven ecosystem. Tableau acts as the "Digital Twin" for visualization, while Salesforce operates as the "Agentic Operating System," handling high-volume signals via Platform Events and resolving issues autonomously using Agentforce.

---

## ☁️ 2. Salesforce Build: The "Agentic OS"

*Moving from simple data storage to an intelligent, event-driven backend.*

### Phase 1: Native Frontend (Lightning Web Components)

**Goal:** Replace the static "List View" with a real-time Action Center inside Salesforce.

* **Component:** `hospitalMonitor` (LWC).
* **Features:**
* Grid layout of active alerts (Cards vs. Rows).
* Visual urgency indicators (Red borders for Critical).
* "One-Click Acknowledge" button using `@wire` service to update records without refreshing.


* **Tech Stack:** JavaScript (ES6), SLDS (Salesforce Lightning Design System), Apex Controllers.

### Phase 2: Event-Driven Architecture (Platform Events)

**Goal:** Decouple the Tableau Extension from the Salesforce Database to handle high-volume traffic (10,000+ signals/min).

* **New Architecture:**
* **Old:** Extension `POST`  `Hospital_Alert__c` (Database Lock risk).
* **New:** Extension `POST`  `Hospital_Signal__e` (Event Bus).


* **Backend Logic:**
* Create **Apex Trigger** on `Hospital_Signal__e`.
* Logic: `after insert`  Validate Data  Create `Hospital_Alert__c`.


* **Why this gets you hired:** Shows mastery of Enterprise patterns and Pub/Sub architecture.

### Phase 3: Agentforce Integration (AI)

**Goal:** Transform from "Notifier" to "Solver".

* **Agent Logic:** Implement an Apex Service (`AgentLogic.cls`) called by the Trigger.
* **Workflow:**
1. Signal received: "Ward C Overcrowded".
2. Agent Analysis: Checks `Staff_Ratios` table.
3. Agent Action: Auto-populates `Resolution_Plan__c` with: *"Divert Ambulance to St. Mary's. Page Dr. Chen."*


* **UI Update:** LWC displays the AI recommendation with a "Robot" icon.

---

## 📊 3. Tableau Build: The "Digital Twin"

*Moving from a static map to a predictive Command Center.*

### Phase 1: Enterprise Data Strategy

**Goal:** Simulate a complex hospital database for deep analytics.

* **Data Structure:** 3 Linked Tables (simulated via Python).
1. **Live Operations:** Real-time occupancy & status.
2. **Historical Logs:** 24-hour hourly snapshots (for trend analysis).
3. **Resource Allocation:** Staffing levels vs. Patient count.



### Phase 2: The "3-Zone" Command Center Dashboard

**Layout Strategy:**

* **Zone 1: Executive Ribbon (Top)**
* **KPIs:** "84% Total Occupancy", "4 Critical Alerts", "42m Avg Wait".
* **Visual:** Sparklines showing the last 24h trend next to each number.


* **Zone 2: Operational Map (Left)**
* **Visual:** The existing Color-Coded Ward Map.
* **Interaction:** Acts as the *Controller*. Clicking "ICU" filters Zone 3.
* **Extension:** Embedded here for immediate action.


* **Zone 3: Deep Dive Analytics (Right)**
* **Chart A (Trends):** Line chart of *Occupancy vs. Time* (Are we spiking?).
* **Chart B (Efficiency):** Dual-Axis chart: *Staff on Duty (Bars)* vs. *Wait Time (Line)*.
* **Insight:** Reveals correlation (e.g., "Wait times spike when staff drops below 5").



---

## 🛠️ 4. Technical Implementation Steps

### A. Data Generation (Python Script)

Save this as `src/scripts/generate_enterprise_data.py`.

```python
import csv
import random
import datetime

def generate_enterprise_data():
    wards = ['Emergency', 'ICU', 'Cardiology', 'Pediatrics', 'Oncology', 'Surgery', 'Maternity', 'General']
    
    # 3-Zone Architecture Data
    header = ['Timestamp', 'Ward_Name', 'Occupancy_Percent', 'Wait_Time_Mins', 'Staff_On_Duty', 'Status']
    data = []

    # Generate 24 hours of history
    now = datetime.datetime.now()
    for hour in range(25): # 0 to 24 hours back
        time_point = now - datetime.timedelta(hours=24-hour)
        
        for ward in wards:
            # Simulate realistic "Spikes"
            base = random.randint(40, 80)
            if ward == 'Emergency' and (18 < time_point.hour or time_point.hour < 4): base += 20
            
            occupancy = min(100, max(0, base + random.randint(-10, 15)))
            wait_time = int(occupancy * 1.2)
            staff = random.randint(3, 12)
            
            status = "Normal"
            if occupancy > 95: status = "Critical"
            elif occupancy > 85: status = "High"

            data.append([time_point.strftime("%Y-%m-%d %H:%M:%S"), ward, occupancy, wait_time, staff, status])

    with open('../data/hospital_enterprise.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(data)
    print("✅ Enterprise Data Generated")

if __name__ == "__main__":
    generate_enterprise_data()

```

### B. Salesforce LWC Scaffold

Run in VS Code terminal:

```bash
sf lightning generate component -n hospitalMonitor -d force-app/main/default/lwc

```

### C. Platform Event Definition

Define in `force-app/main/default/objects/Hospital_Signal__e/Hospital_Signal__e.object-meta.xml`.

---

## 🏆 5. The "Pitch" (Why Hire Me?)

> "I designed VitalFlow not just as an alert system, but as a **Digital Twin** for hospital operations.
> On the **Tableau** side, I implemented a '3-Zone' architecture that allows executives to correlate staffing shortages with wait-time spikes in real-time.
> On the **Salesforce** side, I architected an **Event-Driven** backend using Platform Events to handle high-volume signals, decoupled from the UI. I also built a native **LWC Command Center** to replace static lists with actionable, agentic workflows.
> This represents a complete **Data-to-Action** lifecycle, capable of scaling to enterprise needs."

---

### 🎯 Next Steps for You

1. **Save this file.** It is your roadmap.
2. **Run the Python Script.** Create the new `hospital_enterprise.csv`.
3. **Update Tableau.** Connect to the new data and build the "3-Zone" dashboard.
4. **Start Salesforce Phase 1.** Generate that LWC!
