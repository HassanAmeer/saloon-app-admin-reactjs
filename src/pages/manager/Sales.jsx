import { useState, useEffect, useMemo } from 'react';
import {
    Calendar,
    DollarSign,
    Package,
    TrendingUp,
    Search,
    Hash,
    User,
    ArrowUpRight,
    Layers,
    ReceiptText
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { subscribeToCollection } from '../../lib/services';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import ImageWithFallback from '../../components/ImageWithFallback';
import { Skeleton, TableSkeleton } from '../../components/Skeleton';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const Sales = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [sales, setSales] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('all');
    const [stylistFilter, setStylistFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const querySalonId = searchParams.get('salonId');
    const salonId = querySalonId || user?.salonId;

    useEffect(() => {
        if (!salonId) { setLoading(false); return; }

        const unsubSales = subscribeToCollection(`salons/${salonId}/sales`, (data) => {
            setSales(data);
            setLoading(false);
        }, [], { field: 'createdAt', direction: 'desc' });

        const unsubStylists = subscribeToCollection(`salons/${salonId}/stylists`, setStylists);

        return () => { unsubSales(); unsubStylists(); };
    }, [salonId]);

    // Period filter
    const filteredSales = useMemo(() => {
        const now = new Date();
        return sales.filter(sale => {
            const raw = sale.createdAt || sale.date;
            const saleDate = raw?.toDate ? raw.toDate() : new Date(raw);

            let matchesDate = true;
            if (period === 'today') matchesDate = saleDate.toDateString() === now.toDateString();
            else if (period === 'week') {
                const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
                matchesDate = saleDate >= weekAgo;
            } else if (period === 'month') {
                matchesDate = saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
            } else if (period === 'year') {
                matchesDate = saleDate.getFullYear() === now.getFullYear();
            }

            const matchesStylist = stylistFilter === 'all' || sale.stylistId === stylistFilter || sale.stylistName === stylistFilter;
            const matchesSearch = !searchTerm ||
                sale.stylistName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.id?.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesDate && matchesStylist && matchesSearch;
        });
    }, [sales, period, stylistFilter, searchTerm]);

    // Stats
    const totalRevenue = useMemo(() => filteredSales.reduce((s, sale) => s + (sale.totalAmount || sale.total || 0), 0), [filteredSales]);
    const totalProducts = useMemo(() => filteredSales.reduce((s, sale) => s + (sale.products || []).reduce((ps, p) => ps + (p.quantity || 1), 0), 0), [filteredSales]);
    const totalTransactions = filteredSales.length;
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Chart data — group filtered sales by day (last 14 days) or month
    const chartData = useMemo(() => {
        const now = new Date();
        if (period === 'year') {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const buckets = months.map(name => ({ name, revenue: 0 }));
            filteredSales.forEach(sale => {
                const raw = sale.createdAt || sale.date;
                const d = raw?.toDate ? raw.toDate() : new Date(raw);
                if (!isNaN(d)) buckets[d.getMonth()].revenue += (sale.totalAmount || sale.total || 0);
            });
            return buckets;
        }
        // Default: Last 14 days
        const buckets = Array.from({ length: 14 }, (_, i) => {
            const d = new Date(now); d.setDate(now.getDate() - (13 - i));
            return { name: `${d.getDate()}/${d.getMonth() + 1}`, date: d.toDateString(), revenue: 0 };
        });
        filteredSales.forEach(sale => {
            const raw = sale.createdAt || sale.date;
            const d = raw?.toDate ? raw.toDate() : new Date(raw);
            if (!isNaN(d)) {
                const bucket = buckets.find(b => b.date === d.toDateString());
                if (bucket) bucket.revenue += (sale.totalAmount || sale.total || 0);
            }
        });
        return buckets.map(({ name, revenue }) => ({ name, revenue }));
    }, [filteredSales, period]);

    if (loading) {
        return (
            <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-2"><Skeleton className="h-12 w-64 lg:w-96" /><Skeleton className="h-4 w-48" /></div>
                    <Skeleton className="h-12 w-72 rounded-2xl" />
                </div>
                <div className="glass-card p-4"><Skeleton className="h-14 w-full rounded-2xl" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="stat-card">
                            <div className="flex items-start justify-between mb-4">
                                <Skeleton className="w-10 h-10 rounded-xl" />
                                <Skeleton className="w-16 h-5 rounded-full" />
                            </div>
                            <Skeleton className="h-9 w-24 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    ))}
                </div>
                <Skeleton className="h-64 w-full rounded-2xl" />
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl lg:text-5xl font-black text-tea-900 tracking-tight leading-none">
                        Sales <span className="text-tea-700">Tracking</span>
                    </h1>
                    <p className="text-tea-400 text-[10px] font-black uppercase tracking-widest">
                        Monitor and analyse salon performance
                    </p>
                </div>

                {/* Period Pills */}
                <div className="flex p-1.5 glass-card bg-tea-100/30 border-tea-700/5 rounded-2xl">
                    {['all', 'today', 'week', 'month', 'year'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                                'px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                                period === p ? 'bg-tea-700 text-white shadow-md shadow-tea-700/20' : 'text-tea-500 hover:text-tea-800'
                            )}
                        >
                            {p === 'all' ? 'All Time' : p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters row */}
            <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tea-400" />
                    <input
                        type="text"
                        placeholder="Search by stylist, client or ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="input-field pl-12 h-12 bg-white/50 border-tea-700/5"
                    />
                </div>
                <select
                    value={stylistFilter}
                    onChange={e => setStylistFilter(e.target.value)}
                    className="input-field md:w-56 h-12"
                >
                    <option value="all">All Stylists</option>
                    {stylists.map(s => (
                        <option key={s.id} value={s.name || s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} growth="+12.5%" icon={DollarSign} color="tea" />
                <StatCard label="Products Sold" value={totalProducts.toString()} growth="+8.3%" icon={Package} color="emerald" />
                <StatCard label="Transactions" value={totalTransactions.toString()} growth="+5.1%" icon={ReceiptText} color="amber" />
                <StatCard label="Avg. Sale Value" value={`$${avgTransaction.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} growth="+3.7%" icon={TrendingUp} color="brown" />
            </div>

            {/* Revenue Chart */}
            <div className="glass-card p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-tea-900 uppercase tracking-tight">Revenue Flow</h3>
                        <p className="text-tea-400 text-[10px] font-black uppercase tracking-widest mt-1">
                            {period === 'year' ? 'Monthly breakdown' : 'Last 14 days'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-tea-700 shadow-sm" />
                        <span className="text-[10px] font-black text-tea-500 uppercase tracking-widest">Revenue</span>
                    </div>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8B4513" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#8B4513" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#8B451310" vertical={false} />
                            <XAxis dataKey="name" stroke="#8b6f5c" fontSize={9} fontWeight="900" axisLine={false} tickLine={false} dy={10} />
                            <YAxis stroke="#8b6f5c" fontSize={9} fontWeight="900" axisLine={false} tickLine={false} dx={-10} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #8B451310', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#4a250b', fontSize: '12px', fontWeight: '900' }}
                                formatter={v => [`$${Number(v).toFixed(2)}`, 'Revenue']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#8B4513" strokeWidth={3} fillOpacity={1} fill="url(#salesGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Sales Table */}
            <div className="glass-card overflow-hidden border-none shadow-2xl shadow-tea-900/5">
                <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-tea-900 uppercase tracking-tight">Sales Records</h3>
                        <p className="text-tea-400 text-[10px] font-black uppercase tracking-widest mt-1">{filteredSales.length} transaction{filteredSales.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-tea-50/50">
                            <tr>
                                <th className="text-left p-6 text-[10px] font-black text-tea-500 uppercase tracking-[0.2em]"># ID</th>
                                <th className="text-left p-6 text-[10px] font-black text-tea-500 uppercase tracking-[0.2em]">Date & Time</th>
                                <th className="text-left p-6 text-[10px] font-black text-tea-500 uppercase tracking-[0.2em]">Stylist</th>
                                <th className="text-left p-6 text-[10px] font-black text-tea-500 uppercase tracking-[0.2em]">Client</th>
                                <th className="text-left p-6 text-[10px] font-black text-tea-500 uppercase tracking-[0.2em]">Products</th>
                                <th className="text-center p-6 text-[10px] font-black text-tea-500 uppercase tracking-[0.2em]">Qty</th>
                                <th className="text-right p-6 text-[10px] font-black text-tea-500 uppercase tracking-[0.2em]">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-tea-700/5">
                            {filteredSales.map(sale => {
                                const raw = sale.createdAt || sale.date;
                                const saleDate = raw?.toDate ? raw.toDate() : new Date(raw);
                                const qty = (sale.products || []).reduce((s, p) => s + (p.quantity || 1), 0);
                                const amount = (sale.totalAmount || sale.total || 0);
                                const stylist = stylists.find(s => s.id === sale.stylistId || s.name === sale.stylistName);

                                return (
                                    <tr key={sale.id} className="hover:bg-tea-50/30 transition-colors group">
                                        {/* ID */}
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-tea-100 flex items-center justify-center shrink-0">
                                                    <Hash className="w-3.5 h-3.5 text-tea-500" />
                                                </div>
                                                <span className="text-[10px] font-black text-tea-500 font-mono uppercase tracking-widest">
                                                    {sale.id?.substring(0, 8)}...
                                                </span>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-tea-400 shrink-0" />
                                                <div>
                                                    <p className="text-xs font-black text-tea-900 uppercase tracking-tighter">
                                                        {saleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-[9px] font-black text-tea-400 uppercase tracking-widest">
                                                        {saleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Stylist */}
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-white border border-tea-100 shadow-sm overflow-hidden shrink-0">
                                                    <ImageWithFallback
                                                        src={stylist?.imageUrl}
                                                        alt={sale.stylistName}
                                                        className="w-full h-full object-cover"
                                                        fallbackClassName="w-full h-full flex items-center justify-center bg-tea-50 text-tea-300"
                                                        FallbackComponent={User}
                                                    />
                                                </div>
                                                <p className="text-sm font-black text-tea-900 uppercase tracking-tight">
                                                    {sale.stylistName || 'House Stylist'}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Client */}
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                                                    <User className="w-3 h-3 text-emerald-500" />
                                                </div>
                                                <p className="text-sm font-black text-tea-700 uppercase tracking-tight">
                                                    {sale.clientName || 'Walk-in'}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Products */}
                                        <td className="p-6">
                                            <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                                                {(sale.products || []).length > 0 ? (sale.products || []).map((p, idx) => (
                                                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-tea-100 rounded-lg text-[9px] font-black text-tea-700 uppercase tracking-widest shadow-sm">
                                                        <Package className="w-2.5 h-2.5 text-tea-400" />
                                                        {p.productName || p.name} <span className="text-tea-400">×{p.quantity || 1}</span>
                                                    </span>
                                                )) : (
                                                    <span className="text-[10px] italic text-tea-400 font-bold">Service only</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Qty */}
                                        <td className="p-6 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-tea-100 text-tea-700 text-xs font-black">
                                                {qty}
                                            </span>
                                        </td>

                                        {/* Amount */}
                                        <td className="p-6 text-right">
                                            <div className="space-y-0.5">
                                                <p className="text-lg font-black text-tea-900 tracking-tighter leading-none">
                                                    ${amount.toFixed(2)}
                                                </p>
                                                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em]">Amount</p>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredSales.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-tea-100/50 flex items-center justify-center mb-6">
                                <Layers className="w-10 h-10 text-tea-200" />
                            </div>
                            <h3 className="text-xl font-black text-tea-900 uppercase tracking-tight mb-2">No Sales Found</h3>
                            <p className="text-tea-400 text-xs font-bold uppercase tracking-widest max-w-sm">
                                No records match your current filters. Try adjusting the date period or stylist selection.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Stat card component
const StatCard = ({ label, value, growth, icon: Icon, color }) => {
    const accents = {
        tea: 'text-tea-700 bg-tea-200/50',
        emerald: 'text-emerald-600 bg-emerald-100',
        amber: 'text-amber-600 bg-amber-100',
        brown: 'text-orange-900 bg-orange-100'
    };
    return (
        <div className="stat-card group">
            <div className="flex items-start justify-between mb-4">
                <div className={cn('p-2.5 rounded-xl transition-colors', accents[color])}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-[9px] font-black border px-2 py-0.5 rounded-full uppercase tracking-widest text-emerald-600 border-emerald-600/20 bg-emerald-50">
                    <ArrowUpRight className="w-3 h-3" />
                    {growth}
                </div>
            </div>
            <p className="text-3xl font-black text-tea-900 tracking-tighter group-hover:translate-x-1 transition-transform">{value}</p>
            <p className="text-[10px] font-black text-tea-500 uppercase tracking-[0.2em] mt-1">{label}</p>
        </div>
    );
};

export default Sales;
