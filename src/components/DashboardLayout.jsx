import { Outlet, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToDocument } from '../lib/services';
import { useEffect } from 'react';
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
    X,
    Activity,
    Eye,
    User
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import ImageWithFallback from './ImageWithFallback';

const DashboardLayout = () => {
    const { user, type, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [impersonatedManager, setImpersonatedManager] = useState(null);
    const [impersonatedSalon, setImpersonatedSalon] = useState(null);

    const querySalonId = searchParams.get('salonId');

    // Determine if we are in impersonation mode
    const isImpersonating = type === 'superadmin' && querySalonId;

    useEffect(() => {
        if (!isImpersonating || !querySalonId) {
            setImpersonatedManager(null);
            setImpersonatedSalon(null);
            return;
        }

        // 1. Subscribe to Salon
        const unsubSalon = subscribeToDocument('salons', querySalonId, (salonData) => {
            setImpersonatedSalon(salonData);
            if (salonData?.managerId) {
                // 2. Subscribe to Manager once we have managerId
                const unsubManager = subscribeToDocument('salon_managers', salonData.managerId, (managerData) => {
                    setImpersonatedManager(managerData);
                });
                return () => unsubManager();
            }
        });

        return () => unsubSalon();
    }, [isImpersonating, querySalonId]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const managerNavItems = [
        { path: '/manager/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/manager/stylists', icon: Users, label: 'Stylists' },
        { path: '/manager/products', icon: Package, label: 'Products' },
        { path: '/manager/activity', icon: Activity, label: 'Recent Activity' },
        { path: '/manager/sales', icon: TrendingUp, label: 'Sales & Analytics' },
        { path: '/manager/app-config', icon: Settings, label: 'App Config' },
        { path: '/manager/profile', icon: Users, label: 'Profile' },
    ];

    const superNavItems = [
        { path: '/super/dashboard', icon: LayoutDashboard, label: 'Super Dashboard' },
        { path: '/super/activity', icon: Activity, label: 'Recent Activity' },
        { path: '/super/managers', icon: Users, label: 'salon Managers' },
        { path: '/super/profile', icon: Users, label: 'My Profile' },
        { path: '/super/settings', icon: Settings, label: 'Data Config' },
    ];

    const navItems = isImpersonating ? managerNavItems : (type === 'superadmin' ? superNavItems : managerNavItems);

    const displayUser = isImpersonating && impersonatedManager ? impersonatedManager : user;

    return (
        <div className="min-h-screen bg-tea-50/30 flex flex-col lg:flex-row">
            {/* Mobile Header */}
            <div className="lg:hidden backdrop-blur-md bg-white/80 border-b border-tea-700/10 px-4 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <ImageWithFallback src="/logo.png" alt="salon Logo" className="w-8 h-8 object-contain shrink-0" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-tea-600 to-tea-800 bg-clip-text text-transparent">salon Admin</h1>
                </div>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-xl bg-tea-100/50 hover:bg-tea-200/50 text-tea-800 transition-colors"
                >
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:sticky top-0 left-0 z-50 w-72 h-screen backdrop-blur-xl bg-white/90 border-r border-tea-700/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="px-8 py-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 glass-card flex items-center justify-center p-2 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                                <ImageWithFallback src="/logo.png" alt="salon Logo" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-tea-900 tracking-tight">salon</h1>
                                <p className="text-xs font-medium text-tea-500 uppercase tracking-widest leading-none mt-1">
                                    {isImpersonating ? 'Manager View' : (type === 'superadmin' ? 'Super Admin' : 'Manager')}
                                </p>
                            </div>
                        </div>
                        {isImpersonating && (
                            <div className="mt-6 p-3 bg-tea-900 text-white rounded-xl flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-3.5 h-3.5 text-tea-400 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Mirror Mode</span>
                                </div>
                                <button
                                    onClick={() => navigate('/super/dashboard')}
                                    className="text-[9px] font-black text-tea-400 hover:text-white uppercase tracking-tighter"
                                >
                                    Exit
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                        {navItems.map((item) => {
                            const pathWithQuery = isImpersonating && querySalonId
                                ? `${item.path}?salonId=${querySalonId}`
                                : item.path;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={pathWithQuery}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        cn(
                                            "sidebar-link group",
                                            isActive ? "sidebar-link-active" : ""
                                        )
                                    }
                                >
                                    <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110")} />
                                    <span className="font-medium">{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* User Profile Area */}
                    <div className="p-6 mt-auto">
                        <div className="p-4 glass-card border-none bg-tea-50/50 rounded-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-tea-500 to-tea-700 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-tea-700/20 overflow-hidden border-2 border-white transition-transform group-hover:scale-105 shrink-0">
                                    <ImageWithFallback
                                        src={displayUser?.imageUrl}
                                        alt="User"
                                        className="w-full h-full object-cover"
                                        fallbackClassName="w-full h-full flex items-center justify-center bg-gradient-to-tr from-tea-500 to-tea-700 p-2 text-white/50 shrink-0"
                                        FallbackComponent={User}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black text-tea-900 uppercase tracking-tight truncate">
                                        {displayUser?.name || 'User'}
                                    </p>
                                    <p className="text-[9px] font-bold text-tea-400 uppercase tracking-widest truncate">{displayUser?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-xl transition-all duration-200 text-sm font-semibold group"
                            >
                                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-tea-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 min-h-screen flex flex-col relative">
                <div className="p-4 lg:p-10 flex-1 w-full max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
