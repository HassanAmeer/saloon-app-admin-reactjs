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

const RecentActivity = () => {
    const { role, user } = useAuth();
    const [activities, setActivities] = useState([]);
    const [managers, setManagers] = useState([]);
    const [salons, setSalons] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        let unsubs = [];

        if (role === 'super') {
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
    }, [role, user?.salonId]);

    const filteredActivities = activities
        .filter(act =>
            act.stylistName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            act.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            act.id?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(b.date || b.createdAt?.toDate()) - new Date(a.date || a.createdAt?.toDate()));

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
            <div className="glass-card overflow-hidden border-none shadow-2xl shadow-tea-900/5 bg-white/40 backdrop-blur-xl rounded-[2rem]">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-tea-700/5">
                                <th className="text-left py-8 px-8 text-[11px] font-black text-tea-400 uppercase tracking-[0.25em]">Partner Institution</th>
                                <th className="text-left py-8 px-8 text-[11px] font-black text-tea-400 uppercase tracking-[0.25em]">Personnel & Client</th>
                                <th className="text-left py-8 px-8 text-[11px] font-black text-tea-400 uppercase tracking-[0.25em]">Services / Inventory</th>
                                <th className="text-left py-8 px-8 text-[11px] font-black text-tea-400 uppercase tracking-[0.25em]">Temporal Mark</th>
                                <th className="text-right py-8 px-8 text-[11px] font-black text-tea-400 uppercase tracking-[0.25em]">Valuation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-tea-700/5">
                            {filteredActivities.map((sale) => {
                                const salon = salons.find(s => s.id === sale.salonId);
                                const manager = managers.find(m => m.salonId === sale.salonId);

                                return (
                                    <tr key={sale.id} className="hover:bg-tea-50/50 transition-all duration-500 group">
                                        <td className="py-8 px-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-tea-900 border border-white/10 shadow-2xl overflow-hidden shrink-0 transform group-hover:scale-110 transition-transform duration-500">
                                                    {manager?.imageUrl ? (
                                                        <img src={manager.imageUrl} alt={manager.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-tea-800 to-tea-950">
                                                            <Building2 className="w-6 h-6 text-tea-200/50" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[15px] font-black text-tea-950 uppercase tracking-tight leading-none">{salon?.name || 'Grand Salon'}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-1 h-1 rounded-full bg-tea-300" />
                                                        <p className="text-[10px] font-bold text-tea-500 uppercase tracking-widest leading-none">{manager?.name || 'Executive Lead'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-white border border-tea-100 shadow-sm overflow-hidden shrink-0 group-hover:shadow-lg transition-all duration-500">
                                                    {(() => {
                                                        const stylist = stylists.find(s => s.id === sale.stylistId || s.name === sale.stylistName);
                                                        return stylist?.imageUrl ? (
                                                            <img src={stylist.imageUrl} alt={sale.stylistName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-tea-50 text-tea-800 font-black text-xl">
                                                                {sale.stylistName?.charAt(0) || 'S'}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[15px] font-black text-tea-950 uppercase tracking-tight leading-none">{sale.stylistName || 'Expert Stylist'}</p>
                                                    <div className="flex items-center gap-2 px-2 py-1 bg-tea-100/30 rounded-lg w-fit">
                                                        <User className="w-3 h-3 text-tea-600" />
                                                        <p className="text-[10px] font-black text-tea-600 uppercase tracking-widest leading-none">
                                                            {sale.clientName || 'Premium Client'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-8">
                                            <div className="flex flex-col gap-2 max-w-sm">
                                                <div className="flex flex-wrap gap-2">
                                                    {sale.products?.map((p, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 p-1.5 bg-white border border-tea-100 shadow-sm rounded-xl group/item hover:border-tea-700/20 transition-colors">
                                                            {p.imageUrl && (
                                                                <img src={p.imageUrl} alt={p.productName} className="w-7 h-7 rounded-lg object-cover" />
                                                            )}
                                                            <span className="px-1 text-[10px] font-black text-tea-800 uppercase tracking-tight">
                                                                {p.productName} <span className="text-tea-400 font-bold ml-1">×{p.quantity}</span>
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {(!sale.products || sale.products.length === 0) && (
                                                    <div className="flex items-center gap-2 py-2 px-4 bg-tea-50 rounded-xl border border-dashed border-tea-200">
                                                        <span className="text-[10px] font-black text-tea-400 uppercase tracking-widest">Consultation & Assessment</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-8 px-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-tea-50 flex items-center justify-center border border-tea-100">
                                                    <Calendar className="w-4 h-4 text-tea-700" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-tea-950 uppercase tracking-tighter leading-none">
                                                        {new Date(sale.date || sale.createdAt?.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-tea-400 uppercase tracking-widest leading-none mt-1.5">
                                                        {new Date(sale.date || sale.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-8 text-right">
                                            <div className="space-y-1">
                                                <p className="text-3xl font-black text-tea-900 tracking-tighter leading-none group-hover:text-tea-700 transition-colors">
                                                    <span className="text-sm align-top mr-1 font-bold text-tea-400">$</span>
                                                    {(sale.totalAmount || sale.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em]">Live Transaction</p>
                                                </div>
                                            </div>
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
