import { useState, useEffect } from 'react';
import {
    Activity,
    User,
    Calendar,
    ArrowRight,
    Search,
    Filter,
    Building2,
    Users,
    LogIn
} from 'lucide-react';
import { subscribeToCollectionGroup, subscribeToCollection } from '../../lib/services';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RecentActivitySkeleton } from '../../components/Skeleton';
import ImageWithFallback from '../../components/ImageWithFallback';

const RecentActivity = () => {
    const { type, user } = useAuth();
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [managers, setManagers] = useState([]);
    const [salons, setSalons] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        let unsubs = [];

        if (type === 'superadmin') {
            unsubs = [
                subscribeToCollectionGroup('sales', setActivities),
                subscribeToCollection('salon_managers', setManagers),
                subscribeToCollection('salons', setSalons),
                subscribeToCollectionGroup('stylists', setStylists)
            ];
        } else {
            // Manager view - scoped to their salon sessions
            if (user?.salonId) {
                unsubs = [
                    subscribeToCollection(`salons/${user.salonId}/sales`, setActivities),
                    subscribeToCollection(`salons/${user.salonId}/stylists`, setStylists),
                    subscribeToCollection('salons', (data) => {
                        const mySalon = data.find(s => s.id === user.salonId);
                        if (mySalon) setSalons([mySalon]);
                    })
                ];
            }
        }

        const timeout = setTimeout(() => setLoading(false), 1000);
        return () => {
            unsubs.forEach(unsub => unsub?.());
            if (timeout) clearTimeout(timeout);
        };
    }, [type, user?.salonId]);

    const filteredActivities = activities
        .filter(act =>
            act.stylistName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            act.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            act.id?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(b.date || b.createdAt?.toDate()) - new Date(a.date || a.createdAt?.toDate()));

    if (loading) {
        return <RecentActivitySkeleton />;
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl lg:text-5xl font-black text-tea-900 tracking-tight leading-none group">
                        Recent <span className="text-tea-700">Activity</span>
                    </h1>
                    <p className="text-tea-400 text-[10px] font-black uppercase tracking-widest mt-1">Live feed of global salon operations and service sessions</p>
                </div>

                <div className="relative w-full lg:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tea-400 group-focus-within:text-tea-800 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by stylist, client or session..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-5 pl-12 h-14 bg-white border-2 border-tea-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-tea-700/5 focus:border-tea-700 transition-all duration-300 text-tea-950 font-medium placeholder:text-tea-300 shadow-md shadow-tea-900/5"
                    />
                </div>
            </div>

            {/* Activity Table */}
            <div className="glass-card overflow-hidden border-none shadow-2xl shadow-tea-900/5 bg-white/40 backdrop-blur-xl rounded-[2rem]">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-tea-700/10 bg-tea-50/20">
                                <th className="text-left py-6 px-6 text-[10px] font-black text-tea-600 uppercase tracking-[0.25em] border-r border-tea-700/10 whitespace-nowrap">#_ID</th>
                                <th className="text-left py-6 px-6 text-[10px] font-black text-tea-600 uppercase tracking-[0.25em] border-r border-tea-700/10 whitespace-nowrap">Manager</th>
                                <th className="text-left py-6 px-6 text-[10px] font-black text-tea-600 uppercase tracking-[0.25em] border-r border-tea-700/10 whitespace-nowrap">Stylist/Client</th>
                                <th className="text-left py-6 px-6 text-[10px] font-black text-tea-600 uppercase tracking-[0.25em] border-r border-tea-700/10 whitespace-nowrap">Products</th>
                                <th className="text-left py-6 px-6 text-[10px] font-black text-tea-600 uppercase tracking-[0.25em] border-r border-tea-700/10 whitespace-nowrap">Date</th>
                                <th className="text-right py-6 px-6 text-[10px] font-black text-tea-600 uppercase tracking-[0.25em] border-r border-tea-700/10 whitespace-nowrap">Amounts</th>
                                <th className="text-center py-6 px-6 text-[10px] font-black text-tea-600 uppercase tracking-[0.25em] whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-4 divide-tea-700/5">
                            {filteredActivities.map((sale) => {
                                const salon = salons.find(s => s.id === sale.salonId);
                                const manager = managers.find(m => m.salonId === sale.salonId);

                                return (

                                    <tr key={sale.id} className="hover:bg-tea-50/80 transition-all duration-300 group">

                                        <td className="px-4 py-4 text-center">
                                            <div className="flex items-center gap-1.5 py-1 bg-tea-100/30 rounded-lg w-fit mt-1">
                                                <p className="text-[10px] font-mono font-black text-tea-400 leading-none tracking-tighter"> {sale.id?.substring(0, 8)}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-tea-900 border border-white/10 shadow-lg overflow-hidden shrink-0 transform group-hover:scale-105 transition-transform duration-500">
                                                    <ImageWithFallback
                                                        src={manager?.imageUrl}
                                                        alt={manager?.name}
                                                        className="w-full h-full object-cover"
                                                        fallbackClassName="w-full h-full flex items-center justify-center bg-gradient-to-br from-tea-800 to-tea-950 p-3 text-white/50 shrink-0"
                                                        FallbackComponent={User}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[12px] font-black text-tea-950 uppercase tracking-tight leading-none">{manager?.name || 'Manager'}</p>
                                                    <p className="text-[9px] font-bold text-tea-500 uppercase tracking-widest leading-none">{salon?.name || 'Salon Brand'}</p>
                                                    <div className="flex flex-col gap-1 mt-1 opacity-40">
                                                        <p className="text-[9px] font-mono font-black text-tea-700 leading-none tracking-tighter">MGR: {manager?.id?.substring(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white border border-tea-100 shadow-sm overflow-hidden shrink-0 group-hover:shadow-md transition-all duration-500">
                                                    <ImageWithFallback
                                                        src={stylists.find(s => s.id === sale.stylistId || s.name === sale.stylistName)?.imageUrl}
                                                        alt={sale.stylistName}
                                                        className="w-full h-full object-cover"
                                                        fallbackClassName="w-full h-full flex items-center justify-center bg-tea-50 text-tea-300 p-2 shrink-0"
                                                        FallbackComponent={User}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[12px] font-black text-tea-950 uppercase tracking-tight leading-none">{sale.stylistName || 'Expert Stylist'}</p>
                                                    <div className="flex items-center gap-1.5 py-1 bg-tea-100/30 rounded-lg w-fit mt-1">
                                                        <User className="w-2.5 h-2.5 text-tea-700" />
                                                        <p className="text-[9px] font-black text-tea-700 uppercase tracking-widest leading-none">
                                                            {sale.clientName || 'Premium Client'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                {sale.products?.map((p, idx) => (
                                                    <div key={idx} className="flex items-center gap-1.5 p-1 bg-white border border-tea-100 shadow-xs rounded-lg">
                                                        <ImageWithFallback
                                                            src={p.imageUrl}
                                                            alt={p.productName}
                                                            className="w-5 h-5 rounded object-cover"
                                                            fallbackClassName="w-5 h-5 rounded object-contain filter bg-tea-50"
                                                        />
                                                        <span className="text-[9px] font-black text-tea-800 uppercase tracking-tight">
                                                            {p.productName} <span className="text-tea-400">×{p.quantity}</span>
                                                        </span>
                                                    </div>
                                                ))}
                                                {(!sale.products || sale.products.length === 0) && (
                                                    <div className="px-3 py-1 bg-tea-50/50 rounded-lg border border-dashed border-tea-200">
                                                        <span className="text-[9px] font-black text-tea-400 uppercase tracking-widest">Consultation</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-2 py-4">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="text-tea-700" />
                                                <div className="space-y-1">
                                                    <p className="text-[11px] font-black text-tea-950 uppercase tracking-tighter leading-none">
                                                        {new Date(sale.date || sale.createdAt?.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-[10px] font-black text-tea-400 uppercase tracking-widest leading-none">
                                                        {new Date(sale.date || sale.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="space-y-1">
                                                <p className="text-2xl font-black text-tea-900 tracking-tighter leading-none">
                                                    <span className="text-xs align-top mr-0.5 font-bold text-tea-400">$</span>
                                                    {(sale.totalAmount || sale.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em]">Amount</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                onClick={() => navigate(`/manager/dashboard?salonId=${sale.salonId}`)}
                                                className="px-6 py-3 bg-tea-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-tea-700 hover:scale-105 active:scale-95 transition-all shadow-md shadow-tea-900/10 flex items-center gap-2 mx-auto"
                                            >
                                                Login
                                                <LogIn className="w-3 h-3" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredActivities.length === 0 && !loading && (
                        <div className="py-32 text-center space-y-6">
                            <div className="w-20 h-20 bg-tea-50 rounded-full flex items-center justify-center mx-auto border border-tea-100">
                                <Activity className="w-8 h-8 text-tea-200" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-tea-900 font-black uppercase tracking-[0.3em] text-sm">Silence in the Network</p>
                                <p className="text-tea-400 font-bold text-[10px] uppercase tracking-widest">No transaction signals detected in this cluster</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecentActivity;
