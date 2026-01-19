import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Users, Package, Sparkles, Loader2, BotIcon, ScanFaceIcon } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { subscribeToCollection } from '../lib/services';

const Dashboard = () => {
    const [period, setPeriod] = useState('month');
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Subscribe to all collections
    useEffect(() => {
        const unsubs = [
            subscribeToCollection('sales', setSales),
            subscribeToCollection('products', setProducts),
            subscribeToCollection('stylists', setStylists),
            subscribeToCollection('recommendations', setRecommendations)
        ];

        // Give some time for initial data to load
        const timeout = setTimeout(() => setLoading(false), 1000);

        return () => {
            unsubs.forEach(unsub => unsub());
            clearTimeout(timeout);
        };
    }, []);

    // Helper to check if a date is within the selected period
    const isWithinPeriod = (timestamp) => {
        if (!timestamp) return false;
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (period === 'today') return date >= startOfToday;

        if (period === 'week') {
            const startOfWeek = new Date(now.setDate(now.getDate() - 7));
            return date >= startOfWeek;
        }

        if (period === 'month') {
            const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));
            return date >= startOfMonth;
        }

        return true;
    };

    // Calculate dynamic stats
    const stats = useMemo(() => {
        const filteredSales = sales.filter(s => isWithinPeriod(s.createdAt));
        const filteredRecs = recommendations.filter(r => isWithinPeriod(r.createdAt));

        const totalSales = filteredSales.reduce((sum, s) => sum + (s.total || 0), 0);
        const productsSold = filteredSales.reduce((sum, s) => sum + (s.items?.length || 0), 0);
        const totalScans = filteredRecs.length;

        const totalSuggestions = filteredRecs.reduce((sum, r) => sum + (r.suggestedProducts?.length || 0), 0);
        const totalSoldFromAI = filteredRecs.reduce((sum, r) =>
            sum + (r.suggestedProducts?.filter(p => p.sold).length || 0), 0
        );
        const conversionRate = totalSuggestions > 0 ? ((totalSoldFromAI / totalSuggestions) * 100).toFixed(1) : 0;

        return {
            totalSales,
            productsSold,
            totalScans,
            conversionRate
        };
    }, [sales, recommendations, period]);

    // Data for charts
    const salesByStylistData = useMemo(() => {
        return stylists
            .map(s => ({
                name: s.name?.split(' ')[0] || 'Unknown',
                sales: s.totalSales || 0
            }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);
    }, [stylists]);

    const salesByProductData = useMemo(() => {
        return products
            .filter(p => (p.totalRevenue || 0) > 0)
            .map(p => ({
                name: p.name?.split(' ').slice(0, 2).join(' ') || 'Unknown',
                sales: p.totalRevenue || 0
            }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);
    }, [products]);

    const COLORS = ['#8B4513', '#a67c52', '#c19a6b', '#8b6f47', '#d2b48c'];

    if (loading && sales.length === 0) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="h-10 w-48 skeleton rounded-lg" />
                        <div className="h-4 w-64 skeleton rounded-lg" />
                    </div>
                    <div className="h-10 w-48 skeleton rounded-lg" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card h-32 skeleton rounded-xl" />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card h-[400px] skeleton rounded-xl" />
                    <div className="card h-[400px] skeleton rounded-xl" />
                </div>

                <div className="card h-64 skeleton rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-tea-800">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Overview of your salon performance</p>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                    {['today', 'week', 'month'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${period === p
                                ? 'bg-tea-700 text-white'
                                : 'text-gray-600 hover:bg-tea-100'
                                }`}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Sales"
                    value={`$${stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={TrendingUp}
                    color="brown"
                />
                <StatCard
                    title="Products Sold"
                    value={stats.productsSold}
                    icon={Package}
                    color="tea"
                />
                <StatCard
                    title="AI Scans"
                    value={stats.totalScans}
                    icon={ScanFaceIcon}
                    color="brown"
                />
                <StatCard
                    title="Conversion Rate"
                    value={`${stats.conversionRate}%`}
                    icon={Users}
                    color="tea"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Stylists Chart */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-tea-800 mb-4">Top 5 Stylists by Sales</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesByStylistData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}
                                formatter={(value) => `$${value.toLocaleString()}`}
                            />
                            <Bar dataKey="sales" fill="#8B4513" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Products Chart */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-tea-800 mb-4">Top 5 Products by Revenue</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={salesByProductData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="sales"
                            >
                                {salesByProductData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="card">
                <h3 className="text-lg font-semibold text-tea-800 mb-4">Top Selling Products</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Units Sold</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products
                                .sort((a, b) => (b.unitsSold || 0) - (a.unitsSold || 0))
                                .slice(0, 5)
                                .map((product, index) => (
                                    <tr key={product.id} className="border-b border-gray-100 hover:bg-tea-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-brown-100 rounded-full flex items-center justify-center text-tea-700 font-semibold text-sm">
                                                    {index + 1}
                                                </div>
                                                <span className="font-medium text-gray-900">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-700">{product.unitsSold || 0}</td>
                                        <td className="py-3 px-4 text-right font-semibold text-tea-700">
                                            ${(product.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
        brown: 'bg-brown-100 text-tea-700',
        tea: 'bg-tea-200 text-tea-700',
    };

    return (
        <div className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-tea-800">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
