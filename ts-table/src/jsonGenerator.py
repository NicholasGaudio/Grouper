import random
import json
from datetime import datetime, timedelta

def generate_random_time(date):
    """Generates a random time on the given date between 8:00 AM and 8:00 PM."""
    base_time = datetime.strptime(date + " 08:00", "%Y-%m-%d %H:%M")
    random_minutes = random.randint(0, 12 * 60)  # 12 hours worth of minutes
    random_time = base_time + timedelta(minutes=random_minutes)
    return random_time.strftime("%Y-%m-%d %H:%M")

def generate_random_names(group_size):
    """Generates a list of random names from a group of size group_size."""
    names = [f"Person{str(i)}" for i in range(1, group_size + 1)]
    return random.sample(names, random.randint(0, group_size))  # Randomly select some people to be busy

def generate_json_sample(num_days, group_size):
    """Generates a random JSON sample with specified number of days and group size."""
    start_date = datetime.strptime("2024-11-01", "%Y-%m-%d")
    all_data = []
    
    for day_offset in range(num_days):
        current_date = start_date + timedelta(days=day_offset)
        date_str = current_date.strftime("%Y-%m-%d")
        
        # Generate random times and busy people for this day
        num_entries = random.randint(5, 10)  # Number of time slots for each day
        for _ in range(num_entries):
            time = generate_random_time(date_str)
            busy_people = generate_random_names(group_size)
            busy_count = len(busy_people)
            entry = {
                "time": time,
                "busy_count": busy_count,
                "names_of_people_who_are_busy": busy_people
            }
            all_data.append(entry)
    
    return all_data

# Parameters
num_days = 7  # Number of days to generate
group_size = 100  # Number of people in the group

# Generate the JSON data
data = generate_json_sample(num_days, group_size)

# Save to a JSON file
output_file = "sample_data.json"
with open(output_file, "w") as f:
    json.dump(data, f, indent=4)

print(f"Sample data saved to {output_file}")
