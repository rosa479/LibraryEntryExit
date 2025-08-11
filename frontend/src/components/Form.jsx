import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";


const Form = () => {
  const [roll, setRoll] = useState("")
  const [laptop, setLaptop] = useState("")
  const [books, setBooks] = useState("")

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('here');
    const entry = { roll, laptop, books }
    //clear form
    setRoll("");
    setLaptop("");
    setBooks("");
    try {
      // just change the link here if any problem and contact backend for more setup issues 
      fetch("http://localhost:3000/events/entry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(entry)
      })
        .then(response => response.json())
        .then(data => console.log("Success:", data))
        .catch(error => console.error("Error:", error));
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };




  return (
    <Card>
      <CardHeader>
        <CardTitle>Check In / Out</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input onChange={(e) => setRoll(e.target.value)} value={roll} placeholder="Enter your Roll no" required />
          <div className="flex flex-col md:flex-row gap-4">
            <Input onChange={(e) => setLaptop(e.target.value)} value={laptop} placeholder="Laptop name" />
            <Input onChange={(e) => setBooks(e.target.value)} value={books} placeholder="Book name" />
          </div>
          <Button type="submit" className="w-full">Submit</Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default Form;
