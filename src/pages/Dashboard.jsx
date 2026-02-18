import { useState, useEffect, useMemo } from 'react';
import {
    TrendingUp,
    Users,
    Package,
    Sparkles,
    Loader2,
    BotIcon,
    ScanFaceIcon,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    ChevronRight,
    DollarSign,
    Layers,
    Activity,
    Eye,
    Building2,
    User
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { subscribeToCollection, subscribeToCollectionGroup } from '../lib/services';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';

const Dashboard = ({ forceSalonId }) => {
    const { user, role } = useAuth();
    const [searchParams] = useSearchParams();
    const [period, setPeriod] = useState('month');
    const [sales, setSales] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [managers, setManagers] = useState([]);
    const [clients, setClients] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    const querySalonId = searchParams.get('salonId');
    const salonId = forceSalonId || querySalonId || user?.salonId;
    const isImpersonating = role === 'super' && querySalonId;

    // Subscribe to all collections scoped by salonId
    useEffect(() => {
        let unsubs = [];
        let timeout;

        if (salonId) {
            // Scoped view for specific salon
            unsubs = [
                subscribeToCollection(`salons/${salonId}/sales`, setSales),
                subscribeToCollection(`salons/${salonId}/stylists`, setStylists),
                subscribeToCollectionGroup('clients', setClients, [{ field: 'salonId', operator: '==', value: salonId }]),
                subscribeToCollectionGroup('Ai recommendations', setRecommendations, [{ field: 'salonId', operator: '==', value: salonId }])
            ];
            timeout = setTimeout(() => setLoading(false), 1000);
        } else if (role === 'super') {
            // Aggregate view for Super Admin (all salons)
            unsubs = [
                subscribeToCollectionGroup('sales', setSales),
                subscribeToCollectionGroup('stylists', setStylists),
                subscribeToCollection('salon_managers', setManagers),
                subscribeToCollectionGroup('clients', setClients),
                subscribeToCollectionGroup('Ai recommendations', setRecommendations)
            ];
            timeout = setTimeout(() => setLoading(false), 1000);
        } else {
            // For managers without a salonId, stop the loader so they can see the error
            setLoading(false);
        }

        return () => {
            unsubs.forEach(unsub => unsub?.());
            if (timeout) clearTimeout(timeout);
        };
    }, [salonId, role]);

    // Derived Statistics
    const dashboardStats = useMemo(() => {
        const totalSales = sales.reduce((sum, s) => sum + (s.totalAmount || s.total || 0), 0);
        const productsSold = sales.reduce((sum, s) => sum + (s.products?.reduce((pSum, p) => pSum + p.quantity, 0) || 0), 0);
        const totalScans = recommendations.length;
        const totalStylists = stylists.length;
        const totalClients = stylists.reduce((sum, s) => sum + (s.clientsCount || 0), 0);
        const totalManagers = managers.length;

        return {
            totalSales,
            productsSold,
            totalScans,
            totalStylists,
            totalClients,
            totalManagers,
            salesGrowth: '+12.5%',
            scansGrowth: '+8.2%',
            clientsGrowth: '+5.4%',
            managersGrowth: '+10.0%',
            stylistGrowth: '+4.2%'
        };
    }, [sales, recommendations, stylists, managers]);

    const chartData = [
        { name: 'Mon', revenue: 4200, scans: 45 },
        { name: 'Tue', revenue: 3800, scans: 52 },
        { name: 'Wed', revenue: 5100, scans: 61 },
        { name: 'Thu', revenue: 4600, scans: 48 },
        { name: 'Fri', revenue: 6400, scans: 72 },
        { name: 'Sat', revenue: 7200, scans: 85 },
        { name: 'Sun', revenue: 5800, scans: 59 },
    ];

    const lastSoldProducts = useMemo(() => {
        const allProducts = sales.flatMap(sale =>
            (sale.products || []).map(p => ({
                ...p,
                saleDate: sale.date || sale.createdAt?.toDate(),
                stylistName: sale.stylistName,
                clientName: sale.clientName
            }))
        );

        return allProducts
            .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
            .slice(0, 5);
    }, [sales]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-tea-700 animate-spin" />
                    <p className="text-tea-500 font-black uppercase tracking-[0.2em] text-[10px]">Synchronizing Intelligence</p>
                </div>
            </div>
        );
    }

    if (role === 'manager' && !salonId) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="glass-card p-10 text-center space-y-4 max-w-md">
                    <Activity className="w-12 h-12 text-rose-500 mx-auto" />
                    <h2 className="text-2xl font-black text-tea-900 uppercase">Configuration Error</h2>
                    <p className="text-tea-500 text-sm font-bold">Your manager account is not linked to any Salon ID. Please contact the Super Admin to resolve this.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {isImpersonating && (
                <div className="glass-card p-4 bg-tea-700/10 border-tea-700/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-tea-700 flex items-center justify-center animate-pulse">
                            <Eye className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-[10px] font-black text-tea-900 uppercase tracking-widest leading-none">
                            <span className="text-tea-700">Super Admin Mode:</span> Watching Salon ID {salonId.substring(0, 8)}...
                        </p>
                    </div>
                    <button
                        onClick={() => window.history.back()}
                        className="text-[10px] font-black text-tea-500 hover:text-tea-900 uppercase tracking-[0.2em] underline"
                    >
                        Exit Monitor
                    </button>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl lg:text-5xl font-black text-tea-900 tracking-tight leading-none group">
                        {isImpersonating ? 'Salon' : 'Performance'} <span className="text-tea-700">Analytics</span>
                    </h1>
                    <p className="text-tea-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-tea-700" />
                        Real-time intelligence report for <span className="text-tea-900 font-black">{period.toUpperCase()}</span>
                    </p>
                </div>

                <div className="flex p-1.5 glass-card bg-tea-100/30 border-tea-700/5 rounded-2xl">
                    {['day', 'week', 'month', 'year'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                period === p ? "bg-tea-700 text-white shadow-md shadow-tea-700/20" : "text-tea-500 hover:text-tea-800"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {role === 'super' && !salonId ? (
                    <>
                        <MetricCard
                            label="salon Managers"
                            value={dashboardStats.totalManagers.toLocaleString()}
                            growth={dashboardStats.managersGrowth}
                            icon={Building2}
                            color="tea"
                        />
                        <MetricCard
                            label="Total Stylists"
                            value={dashboardStats.totalStylists.toLocaleString()}
                            growth={dashboardStats.stylistGrowth}
                            icon={ScanFaceIcon}
                            color="emerald"
                        />
                        <MetricCard
                            label="Total Clients"
                            value={dashboardStats.totalClients.toLocaleString()}
                            growth={dashboardStats.clientsGrowth}
                            icon={Users}
                            color="amber"
                        />
                        <MetricCard
                            label="Products Sold"
                            value={dashboardStats.productsSold.toLocaleString()}
                            growth="+14.2%"
                            icon={Package}
                            color="brown"
                        />
                    </>
                ) : (
                    <>
                        <MetricCard
                            label="Gross Revenue"
                            value={`$${dashboardStats.totalSales.toLocaleString()}`}
                            growth={dashboardStats.salesGrowth}
                            icon={DollarSign}
                            color="tea"
                        />
                        <MetricCard
                            label="Service Clients"
                            value={dashboardStats.totalClients.toLocaleString()}
                            growth={dashboardStats.clientsGrowth}
                            icon={Users}
                            color="emerald"
                        />
                        <MetricCard
                            label="AI Engagements"
                            value={dashboardStats.totalScans.toLocaleString()}
                            growth={dashboardStats.scansGrowth}
                            icon={Sparkles}
                            color="amber"
                        />
                        <MetricCard
                            label="Inventory Moved"
                            value={dashboardStats.productsSold.toLocaleString()}
                            growth="+14.2%"
                            icon={Layers}
                            color="brown"
                        />
                    </>
                )}
            </div>

            {/* Charts & Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Revenue Flow Chart */}
                <div className="xl:col-span-2 glass-card p-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-tea-900 uppercase tracking-tight">Revenue Dynamics</h3>
                            <p className="text-tea-400 text-[10px] font-black uppercase tracking-widest mt-1">Weekly financial oscillation</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-tea-700 shadow-sm" />
                                <span className="text-[10px] font-black text-tea-500 uppercase tracking-widest">Revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-tea-200" />
                                <span className="text-[10px] font-black text-tea-500 uppercase tracking-widest">Projection</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B4513" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#8B4513" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#8B451310" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#8b6f5c"
                                    fontSize={10}
                                    fontWeight="900"
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#8b6f5c"
                                    fontSize={10}
                                    fontWeight="900"
                                    axisLine={false}
                                    tickLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #8B451310', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#4a250b', fontSize: '12px', fontWeight: '900' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#8B4513"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#revenueGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Performance Summary Cards */}
                <div className="space-y-8">
                    {/* Last Sold Products */}
                    <div className="glass-card p-6">
                        <h3 className="text-[10px] font-black text-tea-700 uppercase tracking-widest mb-6">Last 5 Sold Products</h3>
                        <div className="space-y-4">
                            {lastSoldProducts.map((product, index) => (
                                <div key={`${product.productName}-${index}`} className="flex items-center gap-4 group cursor-pointer">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl bg-tea-50 border border-tea-100 flex items-center justify-center text-tea-600">
                                            <Package className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-tea-900 group-hover:text-tea-700 transition-colors uppercase tracking-tight">
                                            {product.productName} <span className="text-tea-400">×{product.quantity}</span>
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[9px] font-black text-tea-400 uppercase tracking-widest">
                                                Sold by <span className="text-tea-600 italic">{product.stylistName || 'House Stylist'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-tea-700 uppercase tracking-widest">
                                            ${(product.price * product.quantity || 0).toFixed(2)}
                                        </p>
                                        <p className="text-[9px] font-black text-tea-400 uppercase tracking-widest">
                                            To {product.clientName || 'General Client'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Conversion Status */}
                    {/* <div className="glass-card p-6 bg-gradient-to-br from-tea-700/5 to-transparent border-tea-700/10">
                        <div className="flex items-center gap-3 mb-4">
                            <BotIcon className="w-6 h-6 text-tea-700" />
                            <h3 className="text-[10px] font-black text-tea-900 uppercase tracking-widest">A.I. Conversion</h3>
                        </div>
                        <div className="flex items-end justify-between mb-2">
                            <p className="text-3xl font-black text-tea-900 tracking-tighter">74.2%</p>
                            <span className="text-[9px] font-black text-tea-700 bg-tea-700/10 px-2 py-0.5 rounded-full tracking-widest">OPTIMIZED</span>
                        </div>
                        <div className="w-full bg-tea-100 h-2 rounded-full overflow-hidden mb-4">
                            <div className="w-[74%] h-full bg-gradient-to-r from-tea-700 to-tea-500" />
                        </div>
                        <p className="text-[10px] text-tea-500 font-bold italic">"A.I. recommendations are driving 24% higher average order value today."</p>
                    </div> */}
                </div>
            </div>

        </div>
    );
};

// Internal Components
const cn = (...classes) => classes.filter(Boolean).join(' ');

const MetricCard = ({ label, value, growth, icon: Icon, color }) => {
    const accents = {
        tea: 'text-tea-700 bg-tea-200/50',
        emerald: 'text-emerald-600 bg-emerald-100',
        amber: 'text-amber-600 bg-amber-100',
        brown: 'text-orange-900 bg-orange-100'
    };

    return (
        <div className="stat-card group">
            <div className="flex items-start justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl transition-colors", accents[color])}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className={cn(
                    "flex items-center gap-1 text-[9px] font-black border px-2 py-0.5 rounded-full uppercase tracking-widest",
                    growth.startsWith('+') ? "text-emerald-600 border-emerald-600/20 bg-emerald-50" : "text-rose-600 border-rose-600/20 bg-rose-50"
                )}>
                    {growth.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {growth}
                </div>
            </div>
            <p className="text-3xl font-black text-tea-900 tracking-tighter group-hover:translate-x-1 transition-transform">{value}</p>
            <p className="text-[10px] font-black text-tea-500 uppercase tracking-[0.2em] mt-1">{label}</p>
        </div>
    );
};

export default Dashboard;
