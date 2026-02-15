import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Users,
    Package,
    TrendingUp,
    BotIcon,
    Code2,
    LogOut,
    Menu,
    Settings,
    X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/stylists', icon: Users, label: 'Stylists' },
        { path: '/clients', icon: Users, label: 'Clients' },
        { path: '/products', icon: Package, label: 'Products' },
        { path: '/sales', icon: TrendingUp, label: 'Sales' },
        { path: '/ai-recommendations', icon: BotIcon, label: 'AI Recommendations' },
        { path: '/app-config', icon: Settings, label: 'App Config' },
        { path: '/developer', icon: Code2, label: 'Developer' },
    ];

    return (
        <div className="min-h-screen bg-tea-50">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold text-tea-800">Saloon Admin</h1>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg hover:bg-tea-100"
                >
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    )}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="hidden lg:flex items-center gap-3 px-6 py-5 border-b border-gray-200">
                            <div className="w-14 h-14 flex items-center justify-center overflow-hidden">
                                <img src="/logo.png" alt="Saloon Logo" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-tea-800">Saloon Admin</h1>
                                <p className="text-xs text-gray-500">AI Recommendations</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-4 py-6 space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        isActive ? 'sidebar-link-active' : 'sidebar-link'
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </nav>

                        {/* User Info & Logout */}
                        <div className="border-t border-gray-200 p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-tea-200 rounded-full flex items-center justify-center">
                                    <span className="text-tea-800 font-semibold">
                                        {user?.name?.charAt(0) || 'A'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {user?.name || 'Admin'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <div className="p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
