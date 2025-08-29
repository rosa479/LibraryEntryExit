import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const LibraryApp = () => {
  const [roll, setRoll] = useState("");
  const [laptop, setLaptop] = useState("");
  const [books, setBooks] = useState("");
  const [currentUsers, setCurrentUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch Current Users
  async function fetchCurrent() {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/analytics/current");
      if (!response.ok) {
        throw new Error("Failed to fetch current users");
      }

      const data = await response.json();

      // Transform for table
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

  // 🔹 Submit Entry / Exit
  const handleFormSubmit = async (e, type) => {
    e.preventDefault();

    const entry = { roll, laptop, books };

    try {
      const endpoint =
        type === "entry"
          ? "http://localhost:3000/events/entry"
          : "http://localhost:3000/events/exit";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // ✅ Immediately refresh current users
      fetchCurrent();

      // Reset fields
      setRoll("");
      setLaptop("");
      setBooks("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // 🔹 Initial load + auto-refresh
  useEffect(() => {
    fetchCurrent();
    const interval = setInterval(fetchCurrent, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col gap-10 p-6 text-lg">
      {/* Form Section */}
      <Card className="p-6 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Check In / Out</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-6">
            <Input
              onChange={(e) => setRoll(e.target.value)}
              value={roll}
              placeholder="Enter your Roll no"
              className="text-lg p-4"
              required
            />
            <div className="flex flex-col md:flex-row gap-6">
              <Input
                onChange={(e) => setLaptop(e.target.value)}
                value={laptop}
                placeholder="Laptop name"
                className="text-lg p-4"
              />
              <Input
                onChange={(e) => setBooks(e.target.value)}
                value={books}
                placeholder="Book name"
                className="text-lg p-4"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Button
                type="button"
                className="w-full text-lg py-4 bg-green-600 hover:bg-green-700"
                onClick={(e) => handleFormSubmit(e, "entry")}
              >
                Entry
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full text-lg py-4"
                onClick={(e) => handleFormSubmit(e, "exit")}
              >
                Exit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent Activity Section */}
      <Card className="p-6 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Current Users in Library
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="text-lg">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xl">Roll No</TableHead>
                <TableHead className="text-xl">Status</TableHead>
                <TableHead className="text-xl">Entry Time</TableHead>
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
                [...currentUsers]
                  .slice(-6)  
                  .map((entry, index) => (
                    <TableRow key={index} className="text-lg">
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
    </div>
  );
};

export default LibraryApp;
