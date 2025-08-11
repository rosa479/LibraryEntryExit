
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Layout from './components/Admin/Layout.jsx';
import LogsHistory from './pages/LogHistory.jsx';
import Login from './components/Admin/Login.jsx';
import { Navigate } from 'react-router-dom';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  const token = true;




  return (
    <BrowserRouter>
    <div className="bg-[#0E2864]/5 min-h-screen">
      
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Home />} />

          {/* Admin Layout Routes */}
          <Route path="/dashboard" element={token ? <Layout /> : <Login />}>
            {/* Default route for /dashboard */}
            <Route index element={<Dashboard />} />

            {/* /dashboard/logs */}
            <Route path="logs" element={<LogsHistory />} />
          </Route>
        </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App;
