// App.tsx or App.jsx
import axios from "axios";
import Form from "../components/Form.jsx";
import Navbar from "../components/Navbar.jsx";
import RecentAct from "../components/RecentAct.jsx";

export default function App() {


  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Navbar */}
      <Navbar />

      <main className="flex flex-col items-center py-10 px-4 w-full">
        <h2 className="text-3xl font-bold mb-8">Central Library</h2>

        {/* Unified Container */}
        <div className="w-full max-w-4xl space-y-8">

          {/* Check In/Out Form */}
           <Form />

          {/* Recent Activity */}
          <RecentAct />
          
        </div>
      </main>
    </div>
  );
}
