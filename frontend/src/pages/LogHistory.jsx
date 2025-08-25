// src/pages/LogsHistory.jsx
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export default function LogsHistory() {
  


  const logs = [
    { id: 1, name: "Rahul Sharma", roll: "20CS1001", date: "2025-08-10", checkIn: "09:30 AM", checkOut: "02:15 PM" },
    { id: 2, name: "Priya Verma", roll: "20EE1022", date: "2025-08-10", checkIn: "10:15 AM", checkOut: "" },
    { id: 3, name: "Ankit Gupta", roll: "20ME1045", date: "2025-08-09", checkIn: "11:00 AM", checkOut: "03:45 PM" },
    { id: 4, name: "Simran Kaur", roll: "20CE1067", date: "2025-08-09", checkIn: "11:45 AM", checkOut: "" },
  ];

  const [searchRoll, setSearchRoll] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const filteredLogs = logs.filter(log =>
    (searchRoll ? log.roll.toLowerCase().includes(searchRoll.toLowerCase()) : true) &&
    (searchDate ? log.date === searchDate : true)
  );

  async function fetchLogs() {
    
    const logs = await fetch("http://localhost:3000/api/analytics/range");
  }

  return (
    <div className="p-4 w-full">
      <Card>
        <CardHeader>
          <CardTitle>Logs & History</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Input
              placeholder="Search by Roll No"
              value={searchRoll}
              onChange={(e) => setSearchRoll(e.target.value)}
              className="max-w-sm"
            />
            <Input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check-In Time</TableHead>
                <TableHead>Check-Out Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>{log.name}</TableCell>
                    <TableCell>{log.roll}</TableCell>
                    <TableCell>{log.date}</TableCell>
                    <TableCell>{log.checkIn}</TableCell>
                    <TableCell>{log.checkOut || ""}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No matching records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
