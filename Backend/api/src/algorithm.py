from datetime import datetime

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
