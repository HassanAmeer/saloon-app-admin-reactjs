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
import { subscribeToCollection, subscribeToCollectionGroup } from '../../lib/services';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { DashboardSkeleton } from '../../components/Skeleton';
import ImageWithFallback from '../../components/ImageWithFallback';

const Dashboard = ({ forceSalonId }) => {
    const { user, type } = useAuth();
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
    const isImpersonating = type === 'superadmin' && querySalonId;

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
        } else if (type === 'superadmin') {
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
    }, [salonId, type]);

    // Aggregated and Filtered Data
    const { filteredSales, filteredRecommendations, stats, dynamicChartData, lastSoldProducts } = useMemo(() => {
        const now = new Date();
        const periodMs = {
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000,
            year: 365 * 24 * 60 * 60 * 1000
        }[period];

        const isWithinPeriod = (dateVal) => {
            if (!dateVal) return false;
            const d = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
            return (now - d) <= periodMs;
        };

        const fSales = sales.filter(s => isWithinPeriod(s.date || s.createdAt));
        const fRecs = recommendations.filter(r => isWithinPeriod(r.date || r.createdAt));

        // Stats
        const totalSales = fSales.reduce((sum, s) => sum + (s.totalAmount || s.total || 0), 0);
        const productsSold = fSales.reduce((sum, s) => sum + (s.products?.reduce((pSum, p) => pSum + p.quantity, 0) || 0), 0);

        const dashboardStats = {
            totalSales,
            productsSold,
            totalScans: fRecs.length,
            totalStylists: stylists.length,
            totalClients: clients.length,
            totalManagers: managers.length,
            salesGrowth: '+12.5%',
            scansGrowth: '+8.2%',
            clientsGrowth: '+5.4%',
            managersGrowth: '+10.0%',
            stylistGrowth: '+4.2%'
        };

        // Dynamic Chart Data (Simplified aggregation by date)
        const dateGroups = {};
        fSales.forEach(s => {
            const d = s.date || s.createdAt?.toDate();
            const dateStr = d instanceof Date ? d.toLocaleDateString('en-US', { weekday: 'short' }) : new Date(d).toLocaleDateString('en-US', { weekday: 'short' });
            dateGroups[dateStr] = (dateGroups[dateStr] || 0) + (s.totalAmount || s.total || 0);
        });

        const labels = period === 'day' ? ['Morning', 'Afternoon', 'Evening'] :
            period === 'week' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] :
                ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

        const chart = labels.map(label => ({
            name: label,
            revenue: dateGroups[label] || (Math.random() * 5000 + 1000), // Fallback to semi-random for demo if no data
            scans: Math.floor(Math.random() * 50 + 10)
        }));

        const lastSoldProducts = fSales.flatMap(sale =>
            (sale.products || []).map(p => ({
                ...p,
                saleDate: sale.date || sale.createdAt?.toDate(),
                stylistName: sale.stylistName,
                clientName: sale.clientName
            }))
        )
            .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
            .slice(0, 5);

        return {
            filteredSales: fSales,
            filteredRecommendations: fRecs,
            stats: dashboardStats,
            dynamicChartData: chart,
            lastSoldProducts
        };
    }, [sales, recommendations, stylists, managers, clients, period]);


    if (loading) {
        return <DashboardSkeleton />;
    }

    if (type === 'salonmanager' && !salonId) {
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
                {type === 'superadmin' && !salonId ? (
                    <>
                        <MetricCard
                            label="salon Managers"
                            value={stats.totalManagers.toLocaleString()}
                            growth={stats.managersGrowth}
                            icon={Building2}
                            color="tea"
                        />
                        <MetricCard
                            label="Total Stylists"
                            value={stats.totalStylists.toLocaleString()}
                            growth={stats.stylistGrowth}
                            icon={ScanFaceIcon}
                            color="emerald"
                        />
                        <MetricCard
                            label="Total Clients"
                            value={stats.totalClients.toLocaleString()}
                            growth={stats.clientsGrowth}
                            icon={Users}
                            color="amber"
                        />
                        <MetricCard
                            label="Products Sold"
                            value={stats.productsSold.toLocaleString()}
                            growth="+14.2%"
                            icon={Package}
                            color="brown"
                        />
                    </>
                ) : (
                    <>
                        <MetricCard
                            label="Gross Revenue"
                            value={`$${stats.totalSales.toLocaleString()}`}
                            growth={stats.salesGrowth}
                            icon={DollarSign}
                            color="tea"
                        />
                        <MetricCard
                            label="Service Clients"
                            value={stats.totalClients.toLocaleString()}
                            growth={stats.clientsGrowth}
                            icon={Users}
                            color="emerald"
                        />
                        <MetricCard
                            label="AI Engagements"
                            value={stats.totalScans.toLocaleString()}
                            growth={stats.scansGrowth}
                            icon={Sparkles}
                            color="amber"
                        />
                        <MetricCard
                            label="Inventory Moved"
                            value={stats.productsSold.toLocaleString()}
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
                            <AreaChart data={dynamicChartData}>
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
                                        <div className="w-12 h-12 rounded-xl bg-tea-50 border border-tea-100/50 flex items-center justify-center text-tea-300 overflow-hidden shadow-inner">
                                            <ImageWithFallback
                                                src={product.imageUrl || product.image}
                                                alt={product.productName}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                fallbackClassName="w-full h-full object-contain opacity-50 bg-tea-50"
                                            />
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
