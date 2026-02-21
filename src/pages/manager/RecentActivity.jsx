import { useState, useEffect } from 'react';
import {
    Activity,
    User,
    Calendar,
    ArrowRight,
    Search,
    Filter,
    Building2,
    Users
} from 'lucide-react';
import { subscribeToCollectionGroup, subscribeToCollection } from '../../lib/services';
import { useAuth } from '../../contexts/AuthContext';
import ImageWithFallback from '../../components/ImageWithFallback';
import { RecentActivitySkeleton } from '../../components/Skeleton';

const RecentActivity = () => {
    const { type, user } = useAuth();
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

    if (loading) return <RecentActivitySkeleton />;

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

                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tea-400" />
                    <input
                        type="text"
                        placeholder="Search by stylist, client or session..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-12 h-14 bg-white/50 backdrop-blur-md border-tea-700/5 focus:border-tea-700/20"
                    />
                </div>
            </div>

            {/* Activity Table */}
            <div className="glass-card overflow-hidden border-none shadow-2xl shadow-tea-900/5">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-tea-50/50">
                            <tr>
                                <th className="text-left p-6 text-[10px] font-black text-tea-500 uppercase tracking-[0.2em]">Salon Manager</th>
                                <th className="text-left p-6 text-[10px] font-black text-tea-500 uppercase tracking-[0.2em]">Stylist & Client</th>
                                <th className="text-left p-6 text-[10px] font-black text-tea-500 uppercase tracking-[0.2em]">Products</th>
                                <th className="text-left p-6 text-[10px] font-black text-tea-500 uppercase tracking-[0.2em]">Date</th>
                                <th className="text-right p-6 text-[10px] font-black text-tea-500 uppercase tracking-[0.2em]">Session Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-tea-700/5">
                            {filteredActivities.map((sale) => {
                                const salon = salons.find(s => s.id === sale.salonId);
                                const manager = managers.find(m => m.salonId === sale.salonId);

                                return (
                                    <tr key={sale.id} className="hover:bg-tea-50/30 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-tea-900 border border-white/20 shadow-xl overflow-hidden shrink-0">
                                                    <ImageWithFallback
                                                        src={manager?.imageUrl}
                                                        alt={manager?.name}
                                                        className="w-full h-full object-cover"
                                                        fallbackClassName="w-full h-full flex items-center justify-center bg-tea-900 p-3 text-white/50 shrink-0"
                                                        FallbackComponent={User}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-tea-900 uppercase tracking-tight">{salon?.name || 'Unknown Salon'}</p>
                                                    <p className="text-[9px] font-black text-tea-400 uppercase tracking-widest leading-none mt-1">{manager?.name || 'Partner Executive'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-tea-100 shadow-sm overflow-hidden shrink-0">
                                                    <ImageWithFallback
                                                        src={stylists.find(s => s.id === sale.stylistId || s.name === sale.stylistName)?.imageUrl}
                                                        alt={sale.stylistName}
                                                        className="w-full h-full object-cover"
                                                        fallbackClassName="w-full h-full flex items-center justify-center bg-tea-50 text-tea-300 p-2 shrink-0"
                                                        FallbackComponent={User}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-tea-950 uppercase tracking-tight">{sale.stylistName || 'House Stylist'}</p>
                                                    <p className="text-[9px] font-black text-tea-500 uppercase tracking-widest flex items-center gap-1 leading-none mt-1">
                                                        <User className="w-3 h-3" /> {sale.clientName || 'General Client'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                                                {sale.products?.map((p, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-white border border-tea-100 rounded-lg text-[9px] font-black text-tea-700 uppercase tracking-widest shadow-sm">
                                                        {p.productName} <span className="text-tea-400">×{p.quantity}</span>
                                                    </span>
                                                ))}
                                                {(!sale.products || sale.products.length === 0) && (
                                                    <span className="text-[10px] font-bold text-tea-400 italic">Consultation Only</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-tea-400" />
                                                <div>
                                                    <p className="text-xs font-black text-tea-900 uppercase tracking-tighter">
                                                        {new Date(sale.date || sale.createdAt?.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </p>
                                                    <p className="text-[9px] font-black text-tea-400 uppercase tracking-widest">
                                                        {new Date(sale.date || sale.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="space-y-1">
                                                <p className="text-xl font-black text-tea-900 tracking-tighter leading-none">${(sale.totalAmount || sale.total || 0).toFixed(2)}</p>
                                                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em]">Amount</p>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredActivities.length === 0 && !loading && (
                        <div className="p-20 text-center space-y-4">
                            <Activity className="w-12 h-12 text-tea-100 mx-auto" />
                            <p className="text-tea-400 font-black uppercase tracking-widest text-xs">No activity records found</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default RecentActivity;
