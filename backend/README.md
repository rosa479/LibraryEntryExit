# Library System API Documentation

This document provides a complete reference for the Library System API, which is divided into two main parts: **Event Endpoints** and **Analytics Endpoints**.

---
## Event Endpoints (`/events`)
These endpoints handle the core actions of recording student entries and exits.

### **Endpoint: `POST /entry`**
**Description:** Registers a new "entry" event for a student, logging the time and any items they bring in. It validates the roll number format and checks that the student is not already inside the library.

**Request Body:**
- `roll` (String, **Required**): The unique roll number of the student (e.g., `25CS30045`).
- `laptop` (String, *Optional*): An identifier for the laptop (e.g., serial number).
- `books` (Array of Strings, *Optional*): A list of book titles or IDs the student is bringing in.

**Example Request Body:**
```json
{
  "roll": "25CS30045",
  "laptop": "L-MAC-PQR456",
  "books": ["Operating Systems", "Computer Networks"]
}
```

**Success Response (`200 OK`):**
```json
{
  "message": "Entry recorded successfully"
}
```

**Error Responses:**
- `400 Bad Request`: `{ "error": "Invalid roll number format." }`
- `400 Bad Request`: `{ "error": "Roll is required" }`
- `400 Bad Request`: `{ "error": "Student already inside" }`

---
### **Endpoint: `POST /exit`**
**Description:** Registers a new "exit" event for a student, calculating their duration of stay. It automatically assumes the student leaves with the same items they entered with. The roll number format is validated.

**Request Body:**
- `roll` (String, **Required**): The unique roll number of the student.

**Example Request Body:**
```json
{
  "roll": "25CS30045"
}
```

**Success Response (`200 OK`):**
```json
{
  "message": "Exit recorded successfully",
  "duration": "2 hours 15 minutes 30 seconds"
}
```

**Error Responses:**
- `400 Bad Request`: `{ "error": "Invalid roll number format." }`
- `400 Bad Request`: `{ "error": "Already exited" }`
- `400 Bad Request`: `{ "error": "No prior entry found" }`
- `400 Bad Request`: `{ "error": "Roll is required" }`

---
## Analytics Endpoints (`/analytics`)
These endpoints provide various statistical views of the library usage data.

### **Endpoint: `GET /history`**
**Description:** Retrieves a complete history of entry/exit sessions. The history can be filtered by providing a student's roll number, a specific date, or both.

**Query Parameters:**
- `roll` (String, *Optional*): The unique roll number of the student (e.g., `25ME10132`).
- `date` (String, *Optional*): The date to filter by, in `YYYY-MM-DD` format (e.g., `2025-08-12`).

**Example Requests:**
- `GET /analytics/history?roll=25ME10132`
- `GET /analytics/history?date=2025-08-12`
- `GET /analytics/history?roll=25ME10132&date=2025-08-12`

**Sample Response:**
```json
{
  "sessions": [
    {
      "roll": "25ME10132",
      "entryTime": "2025-08-12T10:02:15.000Z",
      "exitTime": "2025-08-12T12:35:48.000Z",
      "duration": "02:33:33",
      "laptop": "L-DELL-XYZ123",
      "books": null
    },
    {
      "roll": "25CS30045",
      "entryTime": "2025-08-12T15:00:05.000Z",
      "exitTime": "2025-08-12T17:01:10.000Z",
      "duration": "02:01:05",
      "laptop": null,
      "books": ["Digital Design", "Data Structures"]
    }
  ]
}
```

---
### **Endpoint: `GET /current`**
**Description:** Shows a live list of all students currently inside the library.

**Example Request:**
`GET /analytics/current`

**Sample Response:**
```json
{
  "count": 3,
  "laptopCount": 2,
  "current": [
    {
      "roll": "25EE10098",
      "entryTime": "2025-08-28T17:05:10.000Z",
      "durationMinutes": 86,
      "hasLaptop": true
    },
    {
      "roll": "25CS30045",
      "entryTime": "2025-08-28T17:50:22.000Z",
      "durationMinutes": 41,
      "hasLaptop": true
    },
    {
      "roll": "25AE3A001",
      "entryTime": "2025-08-28T15:04:00.000Z",
      "durationMinutes": 207,
      "hasLaptop": false
    }
  ]
}
```

---
### **Endpoint: `GET /range`**
**Description:** Provides a daily count of entries for a given date range. Includes days with zero entries.

**Query Parameters:**
- `start` (**Required**): Start date in `YYYY-MM-DD` format.
- `end` (**Required**): End date in `YYYY-MM-DD` format.

**Example Request:**
`GET /analytics/range?start=2025-08-09&end=2025-08-12`

**Sample Response:**
```json
[
  { "date": "2025-08-09", "entries": 85 },
  { "date": "2025-08-10", "entries": 0 },
  { "date": "2025-08-11", "entries": 152 },
  { "date": "2025-08-12", "entries": 110 }
]
```

---
### **Endpoint: `GET /day/:day`**
**Description:** Returns aggregate statistics for a single day. The date must be in `YYYY-MM-DD` format.

**Example Request:**
`GET /analytics/day/2025-08-11`

**Sample Response:**
```json
{
  "date": "2025-08-11",
  "totalEntries": 152,
  "totalUniqueStudents": 120,
  "avgStayMinutes": 145,
  "laptopUsersCount": 78
}
```

---
### **Endpoint: `GET /month/:month`**
**Description:** Returns aggregate statistics and a daily breakdown for a specific month. The month must be in `YYYY-MM` format.

**Example Request:**
`GET /analytics/month/2025-07`

**Sample Response:**
```json
{
  "month": "2025-07",
  "totalEntries": 3510,
  "uniqueStudents": 452,
  "laptopUsers": 1843,
  "dailyBreakdown": {
    "2025-07-01": 150,
    "2025-07-02": 165,
    "2025-07-03": 158
  }
}
```

---
### **Endpoint: `GET /year/:year`**
**Description:** Returns aggregate statistics and a monthly breakdown for a specific year. The year must be in `YYYY` format.

**Example Request:**
`GET /analytics/year/2025`

**Sample Response:**
```json
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
