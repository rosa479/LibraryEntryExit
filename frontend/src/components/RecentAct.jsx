import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const RecentAct = () => {
  const [currentUsers, setCurrentUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  async function fetchCurrent() {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/analytics/current");
        if (!response.ok) {
          throw new Error("Failed to fetch current users");
        }

        const data = await response.json();

        // Transform to fit your table
        const formatted = data.current.map((user) => ({
          roll: user.roll,
          status: "Checked In", // since all are inside
          time: new Date(user.entryTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setCurrentUsers(formatted);
      } catch (error) {
        console.error(error);
        setCurrentUsers([]);
      } finally {
        setLoading(false);
      }
    }

  useEffect(() => {
    fetchCurrent()


    // Optional: auto-refresh every 10s
    const interval = setInterval(fetchCurrent, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Users in Library</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roll No</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Entry Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : currentUsers.length > 0 ? (
              currentUsers.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.roll}</TableCell>
                  <TableCell className="text-green-600 font-semibold">
                    {entry.status}
                  </TableCell>
                  <TableCell>{entry.time}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500">
                  No users currently inside.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentAct;
