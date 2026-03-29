import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import NavbarUser from './Navbar-User';
import api from '../utils/axios';

const UserLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) {
            navigate('/login');
            return;
        }
        const userData = JSON.parse(loggedInUser);
        setUser(userData);

        // Optional: Background status check for security
        // But the user said "Portal Only Security", so I'll just keep the local state updated
    }, [location.pathname, navigate]);

    // 🔥 Reset scroll to top on page change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    if (!user && location.pathname !== '/login') {
        return null; // Don't render anything while redirecting
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <NavbarUser user={user} onLogout={handleLogout} />
            <div key={location.pathname} className="flex-1 overflow-x-hidden">
                <Outlet context={{ user, setUser, handleLogout }} />
            </div>
        </div>
    );
};

export default UserLayout;
