<<<<<<< HEAD
import datetime
import os.path

from env import CLIENT_ID, CLIENT_SECRET
import requests
from datetime import datetime, timedelta
=======
from datetime import datetime
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2

# Events Lists item
# (start, end, owner), 
# Convert strings to datetime objects
<<<<<<< HEAD
def convert_event_format(event, name):
    # Parse the start and end times
    start_str = event["start"]["dateTime"]
    end_str = event["end"]["dateTime"]
    
    # Convert strings to datetime objects
    start = datetime.fromisoformat(start_str)
    end = datetime.fromisoformat(end_str)
    
    # Return the tuple in the desired format
    return (start.strftime('%Y-%m-%d %H:%M'), end.strftime('%Y-%m-%d %H:%M'), name)
=======
def parse_event(event):
    start, end = event
    return (datetime.strptime(start, '%Y-%m-%d %H:%M'), datetime.strptime(end, '%Y-%m-%d %H:%M'))
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2

# Find Availability Timeline
# Returns a list of Availabilities:
# Availability: (start time, number of people busy, names of people who are busy)
def find_availability_timeline(events_lists):
    time_points = []
    total_people = len(events_lists)

    # Add all events start and end times to the time_points list
<<<<<<< HEAD
    for events in events_lists: # For each person's list
        for event in events: # For each event in each person's list
            time_points.append((event[0], 'start', event[2]))
            time_points.append((event[1], 'end', event[2]))
=======
    for events in events_lists:
        for event in events:
            start, end, owner = parse_event(event), owner
            time_points.append((start, 'start', owner))
            time_points.append((end, 'end', owner))
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2

    # Sort time points by time
    time_points.sort(key=lambda x: x[0])

    # Traverse the time points and count the availability at each point
    busy_count = 0
    availability = []
    previous_event_time = time_points[0][0]
    names_of_people_who_are_busy = []

    for (time, event_type, owner) in time_points:
        if time != previous_event_time:
<<<<<<< HEAD
            availability.append({"time": time, "busy_count": busy_count, "names_of_people_who_are_busy": names_of_people_who_are_busy.copy()})
=======
            availability.append((time, busy_count, names_of_people_who_are_busy))
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2

        if event_type == 'start':
                busy_count += 1
                names_of_people_who_are_busy.append(owner)
        if event_type == 'end':
                busy_count -= 1
                names_of_people_who_are_busy.remove(owner)

        previous_event_time = time

<<<<<<< HEAD
    return {"total_people": total_people, "availability": availability}

# Takes in a User (json)
# Calls Google Calendar API
async def call_calendar_API(user):
    access_token = user.get("access_token")
    refresh_token = user.get("refresh_token")

    if not access_token or not refresh_token:
        raise ValueError("Missing access token or refresh token")

    # Define the time range
    now = datetime.utcnow()
    today_midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end_date = today_midnight + timedelta(days=6, hours=23, minutes=59, seconds=59)

    # Convert to RFC3339 format
    time_min = today_midnight.isoformat() + "Z"
    time_max = end_date.isoformat() + "Z"

    # Google Calendar API URL
    calendar_url = f"https://www.googleapis.com/calendar/v3/calendars/primary/events"
    headers = {"Authorization": f"Bearer {access_token}"}

    # API parameters
    params = {
        "timeMin": time_min,
        "timeMax": time_max,
        "singleEvents": True,
        "orderBy": "startTime"
    }

    # Attempt to fetch events
    response = requests.get(calendar_url, headers=headers, params=params)

    # If token is expired, refresh it
    if response.status_code == 401:
        # Refresh the access token
        token_url = "https://oauth2.googleapis.com/token"
        refresh_payload = {
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token"
        }
        token_response = requests.post(token_url, data=refresh_payload)
        if token_response.status_code == 200:
            new_token_data = token_response.json()
            access_token = new_token_data.get("access_token")
            headers["Authorization"] = f"Bearer {access_token}"

            # Retry fetching events with new token
            response = requests.get(calendar_url, headers=headers, params=params)
        else:
            raise Exception("Failed to refresh access token")
    
    # Check if the response is successful
    if response.status_code == 200:
        events = response.json().get("items", [])

        return events
    else:
        raise Exception(f"Failed to fetch events: {response.text}")
    
# Takes in numerous users
# Creating the Events list
async def algorithm_process_users(users):
    events_lists = []
    for user in users:
        events = await (call_calendar_API(user)) # Get raw events from user

        personal_events = [] # List of (start, end, owner)
        name = user["username"]
        for event in events:
            personal_events.append(convert_event_format(event, name))
        
        events_lists.append(personal_events)
    
    return find_availability_timeline(events_lists)
=======
    return availability
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2
