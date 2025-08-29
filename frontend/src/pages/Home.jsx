// App.tsx or App.jsx
import axios from "axios";
import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import FrontPage from '../components/FrontPage.jsx';

export default function App() {



  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Navbar */}
      <Navbar />

      <main className="flex flex-col items-center py-10 px-4 w-full">
        <h2 className="text-3xl font-bold mb-8">Central Library</h2>

        {/* Unified Container */}
        <div className="w-full max-w-6xl space-y-8">
          <FrontPage/>
        </div>
      </main>
    </div>
  );
}
