create library table with students and logs tables

be sure to populate the students table before anything

curl -X POST http://localhost:3000/events/entry \
  -H "Content-Type: application/json" \
  -d '{
    "roll": "23CS00001",
    "laptop": "DellXPS",
    "books": ["DBMS", "OS"]
  }'

curl -X POST http://localhost:3000/events/exit \
  -H "Content-Type: application/json" \
  -d '{
    "roll": "23CS00001",
    "books": ["DBMS", "OS"]
  }'

curl http://localhost:3000/analytics/history/23CS00001

curl http://localhost:3000/analytics/current

curl http://localhost:3000/analytics/day/2025-08-07

curl http://localhost:3000/analytics/month/2025-08

curl http://localhost:3000/analytics/year/2025
