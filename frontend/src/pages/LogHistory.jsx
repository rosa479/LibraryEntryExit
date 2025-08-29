// src/pages/LogsHistory.jsx
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export default function LogsHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchRoll, setSearchRoll] = useState("");
  const [searchDate, setSearchDate] = useState("");


  async function fetchLogs() {
      try {
        setLoading(true);

        // build query string based on filters
        const queryParams = new URLSearchParams();
        if (searchRoll) queryParams.append("roll", searchRoll);
        if (searchDate) queryParams.append("date", searchDate);
        if(!searchDate && !searchRoll){
          const date = new Date().toISOString().split("T")[0];
          queryParams.append("date", date);
        }

        const response = await fetch(
          `http://localhost:3000/analytics/history?${queryParams.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }

        const data = await response.json();

        // Transform API response to match table format
        const formatted = data.sessions.map((s, idx) => ({
          id: idx,
          roll: s.roll,
          date: s.entryTime.split("T")[0], // take YYYY-MM-DD
          checkIn: new Date(s.entryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          checkOut: s.exitTime
            ? new Date(s.exitTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "",
          laptop: s.laptop,
          books: s.books,
        }));

        setLogs(formatted);
      } catch (error) {
        console.error(error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }

  // Fetch logs from API whenever filters change
  useEffect(() => {
    

    fetchLogs();
  }, [searchRoll, searchDate]);

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
                <TableHead>Roll No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Check-Out</TableHead>
                <TableHead>Laptop</TableHead>
                <TableHead>Books</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.roll}</TableCell>
                    <TableCell>{log.date}</TableCell>
                    <TableCell>{log.checkIn}</TableCell>
                    <TableCell>{log.checkOut || "—"}</TableCell>
                    <TableCell>{log.laptop || "—"}</TableCell>
                    <TableCell>
                      {log.books ? log.books.join(", ") : "—"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
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
