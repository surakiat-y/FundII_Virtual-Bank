import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Portal from './pages/Portal';
import AdminDashboard from './pages/AdminDashboard';
import Statement from './pages/Statement';
import Investment from './pages/Investment';
import YourPocket from './pages/YourPocket';
import UserLayout from './components/UserLayout';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* User Protected Routes with Persistent Navbar */}
        <Route element={<UserLayout />}>
          <Route path="/portal" element={<Portal />} />
          <Route path="/statement" element={<Statement />} />
          <Route path="/investment" element={<Investment />} />
          <Route path="/your-pocket" element={<YourPocket />} />
        </Route>

        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
