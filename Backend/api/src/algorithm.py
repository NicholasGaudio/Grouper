import datetime
import os.path

from env import CLIENT_ID, CLIENT_SECRET
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Define the scope for read-only access to the Google Calendar API
SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]

def get_calendar_events(token: str):
    token = TOKEN
    """Returns the start and name of the next 10 events on the user's calendar."""
    creds = None

    # Load credentials from the provided token string
    creds = Credentials.from_authorized_user_info((token), SCOPES)

    # If credentials are expired, refresh them
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_config(
                {
                    "installed": {
                        "client_id": CLIENT_ID,
                        "client_secret": CLIENT_SECRET,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                    }
                },
                SCOPES,
            )
            creds = flow.run_local_server(port=0)

    try:
        # Build the Google Calendar service
        service = build("calendar", "v3", credentials=creds)

        # Call the Calendar API
        now = datetime.datetime.utcnow().isoformat() + "Z"  # 'Z' indicates UTC time
        events_result = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=now,
                maxResults=10,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
        events = events_result.get("items", [])

        # Return the list of events
        return [(event["start"].get("dateTime", event["start"].get("date")), event["summary"]) for event in events]

    except HttpError as error:
        print(f"An error occurred: {error}")
        return []


# Example usage
if __name__ == "__main__":
    token = input("Enter your token as a string: ")
    events = get_calendar_events(token)

    if not events:
        print("No upcoming events found.")
    else:
        for start, summary in events:
            print(start, summary)



# Events Lists item
# (start, end, owner), 
# Convert strings to datetime objects
def parse_event(event):
    start, end = event
    return (datetime.strptime(start, '%Y-%m-%d %H:%M'), datetime.strptime(end, '%Y-%m-%d %H:%M'))

# Find Availability Timeline
# Returns a list of Availabilities:
# Availability: (start time, number of people busy, names of people who are busy)
def find_availability_timeline(events_lists):
    time_points = []
    total_people = len(events_lists)

    # Add all events start and end times to the time_points list
    for events in events_lists:
        for event in events:
            start, end, owner = parse_event(event), owner
            time_points.append((start, 'start', owner))
            time_points.append((end, 'end', owner))

    # Sort time points by time
    time_points.sort(key=lambda x: x[0])

    # Traverse the time points and count the availability at each point
    busy_count = 0
    availability = []
    previous_event_time = time_points[0][0]
    names_of_people_who_are_busy = []

    for (time, event_type, owner) in time_points:
        if time != previous_event_time:
            availability.append((time, busy_count, names_of_people_who_are_busy))

        if event_type == 'start':
                busy_count += 1
                names_of_people_who_are_busy.append(owner)
        if event_type == 'end':
                busy_count -= 1
                names_of_people_who_are_busy.remove(owner)

        previous_event_time = time

    return availability
