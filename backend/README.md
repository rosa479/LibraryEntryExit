==================================================
==      LIBRARY SYSTEM API DOCUMENTATION      ==
==================================================

This document provides a complete reference for the Library System API, which is divided into two main parts: Event Endpoints and Analytics Endpoints.


==================================================
==   Event Endpoints (/api/events)            ==
==================================================
These endpoints handle the core actions of recording student entries and exits.

---
Endpoint: POST /entry
---
Description: Registers a new "entry" event for a student, logging the time and any items they bring in. It verifies that the student exists and is not already marked as being inside the library.

Request Body:
  - roll (String, Required): The unique roll number of the student.
  - laptop (String, Optional): An identifier for the laptop (e.g., serial number).
  - books (Array of Strings, Optional): A list of book titles or IDs the student is bringing in.

Example Request Body:
{
  "roll": "25CS30045",
  "laptop": "L-MAC-PQR456",
  "books": ["Operating Systems", "Computer Networks"]
}

Success Response (200 OK):
{
  "message": "Entry recorded successfully"
}

Error Responses:
  - 400 Bad Request: { "error": "Student already inside" }
  - 400 Bad Request: { "error": "Roll is required" }
  - 404 Not Found: { "error": "Student not found" }

--------------------------------------------------

---
Endpoint: POST /exit
---
Description: Registers a new "exit" event for a student, calculating their duration of stay. It automatically assumes the student leaves with the same items they entered with; book information is not required in the request.

Request Body:
  - roll (String, Required): The unique roll number of the student.

Example Request Body:
{
  "roll": "25CS30045"
}

Success Response (200 OK):
{
  "message": "Exit recorded successfully",
  "duration": "2 hours 15 minutes 30 seconds"
}

Error Responses:
  - 400 Bad Request: { "error": "Already exited" }
  - 400 Bad Request: { "error": "No prior entry found" }
  - 400 Bad Request: { "error": "Roll is required" }
  - 404 Not Found: { "error": "Student not found" }


==================================================
==   Analytics Endpoints (/api/analytics)     ==
==================================================
These endpoints provide various statistical views of the library usage data.

---
Endpoint: GET /history/:roll
---
Description: Retrieves the complete entry/exit session history for a specific student.

Example Request:
GET /api/analytics/history/25ME10132

Sample Response:
{
  "roll": "25ME10132",
  "sessions": [
    {
      "entryTime": "2025-08-12T10:02:15.000Z",
      "exitTime": "2025-08-12T12:35:48.000Z",
      "duration": { "hours": 2, "minutes": 33, "seconds": 33 },
      "laptop": "L-DELL-XYZ123",
      "books": null
    },
    {
      "entryTime": "2025-08-11T15:00:05.000Z",
      "exitTime": "2025-08-11T17:01:10.000Z",
      "duration": { "hours": 2, "minutes": 1, "seconds": 5 },
      "laptop": null,
      "books": ["Digital Design", "Data Structures"]
    }
  ]
}

--------------------------------------------------

---
Endpoint: GET /current
---
Description: Shows a live list of all students currently inside the library.

Example Request:
GET /api/analytics/current

Sample Response:
{
  "count": 3,
  "laptopCount": 2,
  "current": [
    {
      "roll": "25EE10098",
      "name": "Priya Sharma",
      "entryTime": "2025-08-12T17:05:10.000Z",
      "durationMinutes": 60,
      "hasLaptop": true
    },
    {
      "roll": "25CS30045",
      "name": "Ankit Verma",
      "entryTime": "2025-08-12T17:50:22.000Z",
      "durationMinutes": 15,
      "hasLaptop": true
    },
    {
      "roll": "25AE3A001",
      "name": "Sneha Reddy",
      "entryTime": "2025-08-12T15:04:00.000Z",
      "durationMinutes": 181,
      "hasLaptop": false
    }
  ]
}

--------------------------------------------------

---
Endpoint: GET /range
---
Description: Provides a daily count of entries for a given date range. Includes days with zero entries.

Parameters:
  - start (YYYY-MM-DD)
  - end (YYYY-MM-DD)

Example Request:
GET /api/analytics/range?start=2025-08-09&end=2025-08-12

Sample Response:
[
  { "date": "2025-08-09", "entries": 85 },
  { "date": "2025-08-10", "entries": 0 },
  { "date": "2025-08-11", "entries": 152 },
  { "date": "2025-08-12", "entries": 110 }
]

--------------------------------------------------

---
Endpoint: GET /day/:day
---
Description: Returns aggregate statistics for a single day.

Example Request:
GET /api/analytics/day/2025-08-11

Sample Response:
{
  "date": "2025-08-11",
  "totalEntries": 152,
  "totalUniqueStudents": 120,
  "avgStayMinutes": 145,
  "laptopUsersCount": 78
}

--------------------------------------------------

---
Endpoint: GET /month/:month
---
Description: Returns aggregate statistics and a daily breakdown for a specific month.

Example Request:
GET /api/analytics/month/2025-07

Sample Response:
{
  "month": "2025-07",
  "totalEntries": 3510,
  "uniqueStudents": 452,
  "laptopUsers": 1843,
  "dailyBreakdown": {
    "2025-07-01": 150,
    "2025-07-02": 165,
    "2025-07-03": 158,
    "...": "..."
  }
}

--------------------------------------------------

---
Endpoint: GET /year/:year
---
Description: Returns aggregate statistics and a monthly breakdown for a specific year.

Example Request:
GET /api/analytics/year/2025

Sample Response:
{
  "year": "2025",
  "totalEntries": 25480,
  "uniqueStudents": 980,
  "totalLaptopEntries": 12950,
  "monthWiseBreakdown": {
    "2025-01": 3500,
    "2025-02": 3810,
    "2025-03": 4105,
    "2025-04": 3950,
    "2025-05": 2500,
    "2025-06": 1800,
    "2025-07": 3510,
    "2025-08": 2305
  }
}