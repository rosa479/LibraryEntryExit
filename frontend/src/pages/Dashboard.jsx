import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  LogIn,
  LogOut,
  Users,
  UserCheck,
  UserMinus,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// --------- Configuration: Toggle dummy data here ----------
const USE_DUMMY_DATA = true; // Change this to true to use dummy data

// Total library capacity constant
const TOTAL_CAPACITY = 2000;

// Dummy data for development/demo purposes
const dummyCurrentStats = {
  totalEntries: 135,
  totalUniqueStudents: 95,
  laptopUsersCount: 65,
  avgStayMinutes: 120,
  totalExitsToday: 128,
  studentsWithoutLaptops: 30,
};

const dummyDailyLineData = [
  { date: "2025-08-01", checkins: 95 },
  { date: "2025-08-02", checkins: 80 },
  { date: "2025-08-03", checkins: 110 },
  { date: "2025-08-04", checkins: 120 },
  { date: "2025-08-05", checkins: 70 },
  { date: "2025-08-06", checkins: 90 },
  { date: "2025-08-07", checkins: 85 },
];

const dummyRecentActivities = [
  { id: 1, roll: "25CS30045", type: "Checked In", time: "10:05 AM" },
  { id: 2, roll: "25ME10132", type: "Checked Out", time: "10:15 AM" },
  { id: 3, roll: "25EE10098", type: "Checked In", time: "10:25 AM" },
];

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getDayLabel = (date) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date(date).getDay()];
};

export default function Dashboard() {
  const [filter, setFilter] = useState("daily");
  const [currentStats, setCurrentStats] = useState(null);
  const [lineData, setLineData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentActivities, setRecentActivities] = useState(dummyRecentActivities);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Prepare line chart data (daily -> weekly -> monthly)
  const processLineData = (daily) => {
    setDailyData(daily);

    const today = new Date();
    const weekStart = getStartOfWeek(today);

    const weekly = daily
      .filter(({ date }) => new Date(date) >= weekStart && new Date(date) <= today)
      .map(({ date, checkins }) => ({
        date,
        checkins,
        dayLabel: getDayLabel(date),
      }));
    setWeeklyData(weekly);

    const monthly = daily.map(({ date, checkins }) => ({
      day: date.split("-")[2],
      checkins,
    }));
    setMonthlyData(monthly);

    setLineData(daily);
  };

  // Fetch data from API or use dummy data based on toggle
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_DUMMY_DATA) {
        setCurrentStats(dummyCurrentStats);
        processLineData(dummyDailyLineData);
        setRecentActivities(dummyRecentActivities);
      } else {
        const today = new Date().toISOString().slice(0, 10);
        const month = today.slice(0, 7);

        const dailyRes = await fetch(`http://localhost:3000/analytics/day/${today}`);
        if (!dailyRes.ok) throw new Error("Failed to fetch daily data");
        const dailyJson = await dailyRes.json();
        setCurrentStats(dailyJson);

        const monthRes = await fetch(`http://localhost:3000/analytics/month/${month}`);
        if (!monthRes.ok) throw new Error("Failed to fetch monthly data");
        const monthJson = await monthRes.json();

        const daily = Object.entries(monthJson.dailyBreakdown).map(([date, entries]) => ({
          date,
          checkins: entries,
        }));
        processLineData(daily);

        // TODO: Fetch real recent activities from backend if endpoint is available
        setRecentActivities(dummyRecentActivities); // temp dummy
      }
    } catch (e) {
      setError(e.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (filter === "daily") setLineData(dailyData);
    else if (filter === "weekly") setLineData(weeklyData);
    else if (filter === "monthly") setLineData(monthlyData);
  }, [filter, dailyData, weeklyData, monthlyData]);

  const occupancy = currentStats?.totalUniqueStudents ?? 0;
  const donutData = [
    { name: "Occupied", value: occupancy },
    { name: "Available", value: Math.max(TOTAL_CAPACITY - occupancy, 0) },
  ];

  const COLORS = ["#2563EB", "#E5E7EB"];

  if (loading)
    return <p className="text-center pt-16 text-gray-500 animate-pulse">Loading data...</p>;
  if (error)
    return (
      <p className="text-center pt-16 text-red-500 font-semibold">
        Error loading data: {error}
      </p>
    );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900">Library Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1 max-w-xl">
          Real-time overview of library usage, entries, exits, and duration of stay.
        </p>
      </header>

      {/* Top Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard icon={<LogIn className="w-8 h-8 text-blue-600" />} label="Checked In Today" value={currentStats?.totalEntries ?? 0} />
        <StatCard icon={<Users className="w-8 h-8 text-green-600 animate-pulse" />} label="Currently Inside" value={occupancy} />
        <StatCard icon={<LogOut className="w-8 h-8 text-red-600" />} label="Checked Out Today" value={currentStats?.totalExitsToday ?? 0} />
        <StatCard icon={<Clock className="w-8 h-8 text-yellow-600" />} label="Avg Stay Duration (min)" value={currentStats?.avgStayMinutes ?? 0} />
      </section>

      <Separator />

      {/* Charts Section with adjusted widths */}
      <section className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow lg:flex-grow-[2] shadow rounded-xl bg-white p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Check-ins Over Time</h2>
            <Tabs defaultValue="daily" onValueChange={setFilter} className="max-w-xs">
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={filter === "daily" ? "date" : filter === "weekly" ? "dayLabel" : "day"} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip
                formatter={(value) => [value, "Check-ins"]}
                labelFormatter={(label) => (filter === "weekly" ? label : `Date: ${label}`)}
              />
              <Line type="monotone" dataKey="checkins" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:w-72 shadow rounded-xl bg-white p-4 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Library Capacity</h2>
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={donutData}
                innerRadius={70}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                startAngle={90}
                endAngle={450}
                stroke="none"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-extrabold fill-gray-900"
              >
                {Math.round((occupancy / TOTAL_CAPACITY) * 100)}%
              </text>
              <text
                x="50%"
                y="60%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm fill-gray-600"
              >
                Occupied
              </text>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 text-center text-gray-700 font-semibold">
            {occupancy} / {TOTAL_CAPACITY} Seats
          </div>
        </div>
      </section>

      <Separator />

      {/* Recent Activity Section */}
      <section className="shadow rounded-xl bg-white p-6 max-w-4xl mx-auto">
        <CardTitle>Recent Activity</CardTitle>
        <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto mt-4">
          {recentActivities.length === 0 && (
            <p className="text-gray-500 text-center py-8">No recent activity found</p>
          )}
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex justify-between items-center py-3">
              <div>
                <p className="text-gray-800 font-semibold">{activity.roll}</p>
                <p className="text-gray-500 text-sm">
                  {activity.type} at {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <Card className="flex flex-col shadow rounded-xl border border-gray-100">
      <CardContent className="flex items-center gap-5 p-6">
        <div className="p-3 rounded-lg bg-gray-100 flex items-center justify-center">{icon}</div>
        <div>
          <p className="text-gray-600 uppercase font-semibold tracking-wide text-sm">{label}</p>
          <p className="mt-1 text-3xl font-extrabold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
