# VitalFlow - Hackathon Demo Video Script

**Target Length:** 2-3 Minutes  
**Theme:** "From Dashboards to Decisions: The Agentforce Transformation"

## 🎬 Section 1: The Hook (0:00 - 0:30)
**Visual:** Split screen. Left side: A static spreadsheet/dashboard. Right side: Your new Salesforce Command Center.
**Audio/Script:** 
> "Hospitals are drowning in data. Traditional dashboards tell us *what* happened hours ago. But in a critical ward, knowing isn't enough—we need to act. Introducing **VitalFlow**: The system that turns Tableau signals into Salesforce solutions."

## ⚙️ Section 2: The "Digital Twin" Architecture (0:30 - 1:00)
**Visual:** Show the `FUTURE_ROADMAP.md` diagram or a simple slide showing: 
`Tableau Extension -> Event Bus (Hospital_Signal__e) -> Salesforce Trigger -> Agent Logic`.
**Audio/Script:** 
> "We moved beyond simple API calls. We built an Enterprise Event-Driven Architecture. 
> 1. Our Tableau Extension detects a spike in Ward occupancy.
> 2. It fires a 'Fire-and-Forget' signal to the Salesforce Platform Event Bus.
> 3. This decouples the frontend from the backend, allowing instant scalability."

## 🤖 Section 3: The "Wow" Moment - AI Solver (1:00 - 2:00)
**Visual:** 
1.  Run the Python script (`server.py`) in VS Code terminal. Zoom in on the log: `"Sending Signal: CRITICAL..."`.
2.  Switch immediately to the Salesforce Browser.
3.  **The Money Shot:** Watch the **LWC Command Center** refresh automatically (or on refresh). Point the mouse at the **Einstein Icon** and read the recommendation.
**Audio/Script:** 
> "Watch this. We simulate a critical overflow in the Emergency Ward.
> Immediately, Salesforce catches the signal. But it doesn't just annoy the nurse with an alert.
> Our **Apex Agent Logic** analyzes the severity and automatically prescribes a solution: 'Divert Ambulance to North Wing.' 
> We upgraded from a 'Notifier' to a 'Solver'."

## 💻 Section 4: Under the Hood (2:00 - 2:30)
**Visual:** Quick montage of the code.
-   `HospitalSignalTrigger`: Showing the separation of creating records vs. AI processing.
-   `AgentLogic.cls`: Highlight the decision matrix.
-   `hospitalMonitor` LWC: Show the clean UI code.
**Audio/Script:** 
> "Built with Lightning Web Components for the UI and decoupled Apex Triggers for logic, this system is production-ready. It handles high-volume hospital signals without locking the database."

## 🏥 Section 5: Conclusion (2:30 - End)
**Visual:** Back to the Command Center, showing "Resolved" status.
**Audio/Script:** 
> "VitalFlow bridges the gap between Data Visualization and Clinical Action. We don't just watch the pulse; we keep it flowing. Thank you."
