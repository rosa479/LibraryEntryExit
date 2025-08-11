import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Activity, Clock, LogIn, LogOut, Users } from "lucide-react";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";

const lineData = [
  { time: "8 AM", checkins: 12 },
  { time: "9 AM", checkins: 20 },
  { time: "10 AM", checkins: 34 },
  { time: "11 AM", checkins: 50 },
  { time: "12 PM", checkins: 42 },
  { time: "1 PM", checkins: 30 },
  { time: "2 PM", checkins: 28 },
  { time: "3 PM", checkins: 36 },
];

const barData = [
  { name: "Mon", checkins: 140, checkouts: 120 },
  { name: "Tue", checkins: 160, checkouts: 140 },
  { name: "Wed", checkins: 180, checkouts: 160 },
  { name: "Thu", checkins: 120, checkouts: 110 },
  { name: "Fri", checkins: 200, checkouts: 190 },
];

export default function Dashboard() {
  const [filter, setFilter] = useState("daily");

  return (
    <div className="">

{/* Stats Row */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 py-8">
  <StatCard
    icon={<LogIn className="w-8 h-8 text-blue-500" />}
    label="Checked In Today"
    value="140"
  />
  <StatCard
    icon={<Users className="w-8 h-8 text-green-500 animate-pulse" />}
    label="Currently Inside"
    value="40"
  />
  <StatCard
    icon={<LogOut className="w-8 h-8 text-red-500" />}
    label="Checked Out"
    value="100"
  />
  <StatCard
    icon={<Clock className="w-8 h-8 text-yellow-500" />}
    label="Avg Stay Duration"
    value="1h 44m"
  />
</div>


      <Separator />

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6 p-6">
        {/* Line Chart */}
        <Card className="shadow-sm rounded-xl">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Check-ins Over Time</CardTitle>
            <Tabs defaultValue="daily" onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="checkins" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle>Activity Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="checkins" fill="#16a34a" />
                <Bar dataKey="checkouts" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <Card className="flex-1 shadow-sm rounded-xl">
      <CardContent className="flex items-center gap-6 p-6">
        <div className="p-3 bg-gray-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
