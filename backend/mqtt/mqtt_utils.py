import re

def extract_station_id(topic):
    match = re.match(r"bss/([^/]+)/", topic)
    return match.group(1) if match else "unknown"
