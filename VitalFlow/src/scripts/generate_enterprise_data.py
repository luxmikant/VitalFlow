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
