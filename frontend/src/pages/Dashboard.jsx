import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Clock, LogIn, LogOut, Users } from "lucide-react";
import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// Helper: get ISO week number
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Helper: get start of current week (Sunday)
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Helper: get day of week label, e.g. "Sunday"
const getDayLabel = (date) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date(date).getDay()];
};

export default function Dashboard() {
  const [filter, setFilter] = useState("daily");
  const [data, setData] = useState(null);
  const [lineData, setLineData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  // --- Fetch monthly data (includes daily breakdown) ---
  const fetchLineChartData = async () => {
    try {
      const date = new Date().toISOString().split("T")[0];
      const month = date.split("-").slice(0, 2).join("-");
      const response = await fetch(`http://localhost:3000/analytics/month/${month}`);
      const year = new Date().getFullYear();
      const year_response = await fetch(`http://localhost:3000/analytics/month/${year}}`);
      const json = await response.json();
      const year_json = await year_response.json();

      // Convert dailyBreakdown object into array
      const daily = Object.entries(json.dailyBreakdown).map(([date, value]) => ({
        date,
        checkins: value || 0,
      }));
      setDailyData(daily);

      // --- Weekly Data: Only current week (Sunday -> today), with dayLabel ---
      const today = new Date();
      const weekStart = getStartOfWeek(today);

      // Filter daily data to current week (Sunday->today)
      const weekly = daily
        .filter(({ date }) => {
          const d = new Date(date);
          // Compare date parts only, ignore hours
          return d >= weekStart && d <= today;
        })
        .map(({ date, checkins }) => ({
          date,
          checkins,
          dayLabel: getDayLabel(date),
        }));

      setWeeklyData(weekly);

      // --- Monthly Data: All days of current month, x-axis = day number (dd) ---
      const monthly = daily.map(({ date, checkins }) => ({
        day: date.split('-')[2], // Only 'dd'
        checkins,
      }));
      setMonthlyData(monthly);

      // Default view = daily
      setLineData(daily);
    } catch (error) {
      console.error("Error fetching line chart data:", error);
    }
  };

  // --- Fetch current day's info ---
  const currentInfo = async () => {
    try {
      const date = new Date().toISOString().split("T");
      console.log(date[0])
      const res = await fetch(`http://localhost:3000/api/analytics/day/${date[0]}`);
      setData(res);
    } catch (error) {
      console.error("Error fetching current info:", error);
    }
  };

  // --- Switch line chart data on filter change ---
  useEffect(() => {
    if (filter === "daily") setLineData(dailyData);
    else if (filter === "weekly") setLineData(weeklyData);
    else if (filter === "monthly") setLineData(monthlyData);
  }, [filter, dailyData, weeklyData, monthlyData]);

  useEffect(() => {
    currentInfo();
    fetchLineChartData();
  }, []);

  if (!data) return <p className="text-center pt-10">Loading...</p>;

  return (
    <div className="">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 py-8">
        <StatCard
          icon={<LogIn className="w-8 h-8 text-blue-500" />}
          label="Checked In Today"
          value={data.totalEntries}
        />
        <StatCard
          icon={<Users className="w-8 h-8 text-green-500 animate-pulse" />}
          label="Currently Inside"
          value={data.totalUniqueStudents}
        />
        <StatCard
          icon={<LogOut className="w-8 h-8 text-red-500" />}
          label="Laptop Users"
          value={data.laptopUsersCount}
        />
        <StatCard
          icon={<Clock className="w-8 h-8 text-yellow-500" />}
          label="Avg Stay Duration"
          value={`${data.avgStayMinutes} min`}
        />
      </div>

      <Separator />

      <div className="grid md:grid-cols-1 gap-6 p-6">
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
                <XAxis
                  dataKey={
                    filter === "daily"
                      ? "date"
                      : filter === "weekly"
                      ? "dayLabel" // Show "Sunday", "Monday", etc.
                      : "day" // Monthly: show "dd"
                  }
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="checkins"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
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
