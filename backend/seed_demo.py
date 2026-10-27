"""Optional demo content. Creates real tasks through the API, only in an empty workspace."""
from datetime import date, timedelta
import httpx

API = "http://127.0.0.1:8000/api/tasks"
EXAMPLES = [
    ("Map out the week ahead", "A little planning now, a little more breathing room later.", "pending", "medium", 4),
    ("Gather inspiration for the dashboard", "Collect a few thoughtful references for the next design session.", "completed", "low", 3),
    ("Polish the mobile experience", "Check the small details across phone and tablet layouts.", "pending", "medium", 2),
    ("Write the project documentation", "Make the setup clear, simple, and easy to follow.", "in_progress", "medium", 2),
    ("Review the new dashboard design", "Bring a fresh pair of eyes to the colors, spacing, and flow.", "in_progress", "high", 1),
    ("Set up the project workspace", "Create a tidy foundation for all the good things to come.", "completed", "low", 0),
]

if __name__ == "__main__":
    with httpx.Client(timeout=10) as client:
        response = client.get(API)
        response.raise_for_status()
        if response.json():
            print("Workspace already contains tasks. No demo tasks added.")
        else:
            for title, description, status, priority, days in EXAMPLES:
                response = client.post(API, json={"title": title, "description": description,
                    "status": status, "priority": priority, "dueDate": (date.today() + timedelta(days=days)).isoformat()})
                response.raise_for_status()
            print("Created six demo tasks through the live API. Edit or delete them like any other task.")
