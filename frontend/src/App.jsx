import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Portal from './pages/Portal';
import AdminDashboard from './pages/AdminDashboard';
import Statement from './pages/Statement';
import Investment from './pages/Investment';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<SignUp />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/statement" element={<Statement />} />
        <Route path="/investment" element={<Investment />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
