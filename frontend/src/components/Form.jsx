import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Form = ({ setRecent }) => {
  const [roll, setRoll] = useState("");
  const [laptop, setLaptop] = useState("");
  const [books, setBooks] = useState("");

  // Main function using async/await pattern
  const handleFormSubmit = async (e, type) => {
    e.preventDefault();
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    const timeString = `${hours}:${minutes} ${ampm}`;

    const activities = {
      roll,
      laptop,
      books,
      time: timeString,
      status: type === "entry" ? "Checked In" : "Checked Out",
    };
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

      // HTTP error check
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setRecent((prev) => [...prev, activities]);


      setRoll("");
      setLaptop("");
      setBooks("");
    } catch (error) {
      console.error("Error:", error);
      // Optionally show feedback to user here (e.g. toast or message)
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check In / Out</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4">
          <Input
            onChange={(e) => setRoll(e.target.value)}
            value={roll}
            placeholder="Enter your Roll no"
            required
          />
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              onChange={(e) => setLaptop(e.target.value)}
              value={laptop}
              placeholder="Laptop name"
            />
            <Input
              onChange={(e) => setBooks(e.target.value)}
              value={books}
              placeholder="Book name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              className="w-full bg-green-600 hover:bg-green-600 active:bg-green-600 focus:bg-green-600"
              onClick={(e) => handleFormSubmit(e, "entry")}
            >
              Entry
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={(e) => handleFormSubmit(e, "exit")}
            >
              Exit
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default Form;
