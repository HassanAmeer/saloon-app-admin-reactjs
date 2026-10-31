import { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit,
    Eye,
    EyeOff,
    User,
    UserX,
    Check,
    X,
    Users,
    TrendingUp,
    Package,
    Settings,
    ArrowUpRight,
    Camera,
    Upload,
    ArrowLeft,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    Bot,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    ShoppingBag,
    ChevronRight,
    Activity,
    Tag
} from 'lucide-react';
import {
    subscribeToCollection,
    createDocument,
    updateDocument,
    uploadImage,
    getDocument,
    checkEmailExists
} from '../../lib/services';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { sendStylistCreatedEmail, sendStylistUpdatedEmail } from '../../lib/email';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

import { useNavigate, useSearchParams } from 'react-router-dom';
import ImageWithFallback from '../../components/ImageWithFallback';
import { ManagersSkeleton } from '../../components/Skeleton';
import { themeColors } from '../../config';

const Stylists = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const [stylists, setStylists] = useState([]);
    const [sales, setSales] = useState([]);
    const [salonInfo, setSalonInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedStylist, setSelectedStylist] = useState(null);
    const [viewingDetail, setViewingDetail] = useState(false);

    const querySalonId = searchParams.get('salonId');
    const salonId = querySalonId || user?.salonId;

    useEffect(() => {
        if (!salonId) {
            setLoading(false);
            return;
        }

        const fetchSalon = async () => {
            try {
                const data = await getDocument('salons', salonId);
                if (data) setSalonInfo(data);
            } catch (err) {
                console.error("Error fetching salon data:", err);
            }
        };
        fetchSalon();

        const unsubStylists = subscribeToCollection(`salons/${salonId}/stylists`, (data) => {
            setStylists(data);
            setLoading(false);
        }, [], { field: 'createdAt', direction: 'desc' });

        const unsubSales = subscribeToCollection(`salons/${salonId}/sales`, (data) => {
            setSales(data);
        });

        return () => {
            unsubStylists();
            unsubSales();
        };
    }, [salonId]);

    // Compute live active metrics (excluding refunded & cancelled sales) per stylist
    const stylistMetrics = useMemo(() => {
        const metrics = {};
        sales.forEach(sale => {
            const status = (sale.status || '').toLowerCase();
            const isActive = status !== 'cancelled' && status !== 'canceled' && status !== 'refunded' && !sale.cancelledAt && !sale.refundedAt;
            if (!isActive) return;

            const stId = sale.stylistId;
            const stName = sale.stylistName?.trim().toLowerCase();
            const amount = sale.totalAmount || sale.total || 0;
            const units = sale.products?.reduce((sum, p) => sum + (p.quantity || 1), 0) || 1;

            const keys = [];
            if (stId) keys.push(`id:${stId}`);
            if (stName) keys.push(`name:${stName}`);

            keys.forEach(k => {
                if (!metrics[k]) metrics[k] = { sales: 0, units: 0 };
                metrics[k].sales += amount;
                metrics[k].units += units;
            });
        });
        return metrics;
    }, [sales]);

    // Keep Firestore stylist records synced with actual live active sales in background
    useEffect(() => {
        if (!salonId || stylists.length === 0) return;
        stylists.forEach(async (stylist) => {
            const m = stylistMetrics[`id:${stylist.id}`] || stylistMetrics[`name:${stylist.name?.trim().toLowerCase()}`] || { sales: 0, units: 0 };
            if ((stylist.totalSales || 0) !== m.sales || (stylist.unitsSold || 0) !== m.units) {
                try {
                    await updateDoc(doc(db, 'salons', salonId, 'stylists', stylist.id), {
                        totalSales: m.sales,
                        unitsSold: m.units
                    });
                } catch (e) {
                    console.warn("Auto-syncing stylist stats in background:", e);
                }
            }
        });
    }, [stylists, stylistMetrics, salonId]);

    const filteredStylists = stylists.filter(stylist => {
        const matchesSearch = stylist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stylist.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || stylist.status?.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleSave = async (data) => {
        try {
            const effectiveSalonId = salonId || user?.salonId;
            const folderPath = `salons/${effectiveSalonId}/stylists`;
            const currentSalonName = salonInfo?.name || user?.salonName || user?.name || 'Salon Profit Bar';

            // Validate required fields
            const validationErrors = [];
            if (!data.name?.trim()) validationErrors.push('Full Name is required');
            if (!data.email?.trim()) validationErrors.push('Email is required');
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) validationErrors.push('Invalid email format');
            if (!data.phone?.trim()) validationErrors.push('Phone number is required');
            if (modalMode === 'add' && !data.password?.trim()) validationErrors.push('Password is required');
            else if (modalMode === 'add' && data.password && data.password.length < 8) validationErrors.push('Password must be at least 8 characters');

            if (validationErrors.length > 0) {
                showToast(validationErrors.join(', '), 'error');
                return;
            }

            // Check email uniqueness
            const excludeId = modalMode === 'edit' ? selectedStylist?.id : null;
            const emailCheck = await checkEmailExists(data.email, excludeId);
            if (emailCheck.exists) {
                showToast('This email is already connected to an account.', 'error');
                return;
            }

            if (modalMode === 'add') {
                await createDocument(folderPath, {
                    ...data,
                    salonId: effectiveSalonId,
                    totalSales: 0,
                    unitsSold: 0,
                    clientsCount: 0,
                    scansCount: 0,
                    createdAt: new Date()
                });

                try {
                    await sendStylistCreatedEmail({
                        email: data.email,
                        name: data.name,
                        password: data.password,
                        phone: data.phone,
                        salonName: currentSalonName,
                        skills: data.skills
                    });
                } catch (emailErr) {
                    console.error('Stylist creation email failed:', emailErr);
                }

                showToast('Stylist registered and invitation email sent', 'success');
            } else {
                const updateData = { ...data };
                const passwordUpdated = Boolean(updateData.password);
                if (!updateData.password) delete updateData.password;
                await updateDocument(folderPath, selectedStylist.id, updateData);

                try {
                    await sendStylistUpdatedEmail({
                        email: updateData.email || selectedStylist.email,
                        name: updateData.name || selectedStylist.name,
                        phone: updateData.phone || selectedStylist.phone,
                        status: updateData.status || selectedStylist.status,
                        salonName: currentSalonName,
                        passwordUpdated
                    });
                } catch (emailErr) {
                    console.error('Stylist update email failed:', emailErr);
                }

                showToast('Stylist updated and notification email sent', 'success');
            }
            setShowModal(false);
        } catch (error) {
            console.error(error);
            showToast('Error saving stylist', 'error');
        }
    };

    if (loading) return <ManagersSkeleton />;

    if (viewingDetail && selectedStylist) {
        return <StylistDetail stylist={selectedStylist} salonId={salonId} onBack={() => setViewingDetail(false)} />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-tea-900 tracking-tight">Team <span className="text-tea-700">Members</span></h1>
                    <p className="text-tea-500 font-bold text-xs uppercase tracking-widest leading-none">Manage Stylist profiles and monitor performance</p>
                </div>
                <button onClick={() => { setModalMode('add'); setSelectedStylist(null); setShowModal(true); }} className="btn-primary">
                    <Plus className="w-5 h-5" />
                    <span>Register Stylist</span>
                </button>
            </div>

            <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tea-400" />
                    <input
                        type="text"
                        placeholder="Filter by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-12 bg-white/50 border-tea-700/5"
                    />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field md:w-56 bg-white/50 border-tea-700/5">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredStylists.map((stylist) => {
                    const metrics = stylistMetrics[`id:${stylist.id}`] || stylistMetrics[`name:${stylist.name?.trim().toLowerCase()}`] || {
                        sales: stylist.totalSales || 0,
                        units: stylist.unitsSold || 0
                    };
                    const displaySales = metrics.sales;
                    const displayUnits = metrics.units;

                    return (
                        <div key={stylist.id} className="glass-card overflow-hidden group hover:bg-tea-50/50">
                            <div className="p-6 flex flex-col md:flex-row gap-6">
                                <div className="flex flex-col items-center gap-4 min-w-[140px]">
                                    <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-tea-700/5 transition-all">
                                        <ImageWithFallback
                                            src={stylist.imageUrl}
                                            alt={stylist.name}
                                            className="w-full h-full object-cover"
                                            fallbackClassName="w-full h-full flex items-center justify-center text-tea-300 shrink-0"
                                            FallbackComponent={User}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-black text-tea-900 uppercase tracking-tight">{stylist.name}</h3>
                                        <p className="text-[9px] font-black text-tea-400 uppercase tracking-widest">{stylist.status}</p>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-6">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <StatMini label="Sales" value={`$${displaySales.toLocaleString()}`} />
                                        <StatMini label="Clients" value={stylist.clientsCount || 0} />
                                        <StatMini label="Units" value={displayUnits.toLocaleString()} />
                                        <StatMini label="Scans" value={stylist.scansCount || 0} />
                                    </div>
                                    <div className="flex gap-2 pt-4 border-t border-tea-700/5">
                                        <button onClick={() => { setSelectedStylist(stylist); setViewingDetail(true); }} className="flex-1 btn-secondary text-[10px] font-black uppercase tracking-widest"><Eye className="w-4 h-4" /> View Details</button>
                                        <button onClick={() => { setSelectedStylist(stylist); setModalMode('edit'); setShowModal(true); }} className="p-2 btn-secondary"><Edit className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredStylists.length === 0 && (
                <div className="glass-card py-32 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-tea-50 flex items-center justify-center mb-6">
                        <Users className="w-10 h-10 text-tea-200" />
                    </div>
                    <h3 className="text-2xl font-black text-tea-900 uppercase tracking-tight mb-2">No team members yet</h3>
                    <p className="text-tea-400 text-xs font-bold uppercase tracking-widest max-w-sm mb-6">
                        Start building your salon team by registering your first stylist.
                    </p>
                    <button
                        onClick={() => { setModalMode('add'); setSelectedStylist(null); setShowModal(true); }}
                        className="btn-primary flex items-center gap-3 px-8 h-12 rounded-2xl"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Register Stylist</span>
                    </button>
                </div>
            )}

            {showModal && <StylistModal mode={modalMode} stylist={selectedStylist} onClose={() => setShowModal(false)} onSave={handleSave} />}
        </div>
    );
};

const StatMini = ({ label, value }) => (
    <div className="space-y-1">
        <p className="text-[8px] font-black text-tea-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-black text-tea-900">{value}</p>
    </div>
);

const isSaleActive = (sale) => {
    const status = (sale.status || '').toLowerCase();
    return status !== 'cancelled' && status !== 'canceled' && status !== 'refunded' && !sale.cancelledAt && !sale.refundedAt;
};

const getSaleStatus = (sale) => {
    const status = (sale.status || '').toLowerCase();
    if (status === 'cancelled' || status === 'canceled' || sale.cancelledAt) return 'Cancelled';
    if (status === 'refunded' || sale.refundedAt) return 'Refunded';
    return 'Completed';
};

const StylistDetail = ({ stylist, salonId, onBack }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('analytics');
    const [allSales, setAllSales] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        if (!stylist.id || !salonId) return;

        const unsubs = [
            subscribeToCollection(`salons/${salonId}/sales`, setAllSales),
            subscribeToCollection(`salons/${salonId}/stylists/${stylist.id}/Ai recommendations`, setRecommendations, [], { field: 'createdAt', direction: 'desc' })
        ];
        return () => unsubs.forEach(u => u());
    }, [stylist.id, salonId]);

    // Compute sales belonging only to this stylist
    const sales = useMemo(() => {
        return allSales.filter(sale =>
            sale.stylistId === stylist.id ||
            sale.stylistName?.toLowerCase() === stylist.name?.toLowerCase()
        ).sort((a, b) => new Date(b.date || b.createdAt?.toDate()) - new Date(a.date || a.createdAt?.toDate()));
    }, [allSales, stylist]);

    // Derive organic clients list from the stylist's sales history
    const clients = useMemo(() => {
        const clientsMap = new Map();
        sales.forEach(sale => {
            const key = sale.clientId || sale.clientName;
            if (key && !clientsMap.has(key)) {
                clientsMap.set(key, {
                    id: key,
                    name: sale.clientName || 'Private Client',
                    email: 'Member',
                    joinDate: sale.date || sale.createdAt?.toDate() || new Date(),
                    status: 'Active'
                });
            }
        });
        return Array.from(clientsMap.values());
    }, [sales]);

    const { statsData, growthStats } = useMemo(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const chartBuckets = days.map(name => ({ name, sales: 0, clients: 0 }));
        const dayClients = days.map(() => new Set());

        sales.forEach(sale => {
            const raw = sale.date || sale.createdAt;
            const d = raw?.toDate ? raw.toDate() : new Date(raw);
            if (!d || isNaN(d.getTime())) return;

            let dayIndex = d.getDay() - 1; // Mon is 0
            if (dayIndex === -1) dayIndex = 6; // Sun is 6

            if (chartBuckets[dayIndex]) {
                if (isSaleActive(sale)) {
                    chartBuckets[dayIndex].sales += (sale.totalAmount || sale.total || 0);
                }
                const clientId = sale.clientId || sale.clientName;
                if (clientId) dayClients[dayIndex].add(clientId);
            }
        });

        chartBuckets.forEach((bucket, i) => {
            bucket.clients = dayClients[i].size;
        });

        // Growth metrics
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        let currSales = 0, prevSales = 0;
        let currClients = new Set(), prevClients = new Set();

        sales.forEach(sale => {
            const raw = sale.date || sale.createdAt;
            const d = raw?.toDate ? raw.toDate() : new Date(raw);
            if (!d || isNaN(d.getTime())) return;

            if (isSaleActive(sale)) {
                if (d >= sevenDaysAgo) {
                    currSales += (sale.totalAmount || sale.total || 0);
                } else if (d >= fourteenDaysAgo) {
                    prevSales += (sale.totalAmount || sale.total || 0);
                }
            }

            if (d >= sevenDaysAgo) {
                if (sale.clientId || sale.clientName) currClients.add(sale.clientId || sale.clientName);
            } else if (d >= fourteenDaysAgo) {
                if (sale.clientId || sale.clientName) prevClients.add(sale.clientId || sale.clientName);
            }
        });

        const sGrowth = prevSales === 0 ? (currSales > 0 ? 100 : 0) : ((currSales - prevSales) / prevSales) * 100;
        const cGrowth = prevClients.size === 0 ? (currClients.size > 0 ? 100 : 0) : ((currClients.size - prevClients.size) / prevClients.size) * 100;

        // Dynamic Retention Calculation
        // % of clients who have visited more than once in the entire history
        const visitCounts = {};
        sales.forEach(sale => {
            const id = sale.clientId || sale.clientName;
            if (id) visitCounts[id] = (visitCounts[id] || 0) + 1;
        });

        const totalDistinct = Object.keys(visitCounts).length;
        const repeatClients = Object.values(visitCounts).filter(count => count > 1).length;
        const retentionRate = totalDistinct === 0 ? 0 : (repeatClients / totalDistinct) * 100;

        return {
            statsData: chartBuckets,
            growthStats: {
                salesGrowth: sGrowth >= 0 ? `+${sGrowth.toFixed(1)}%` : `${sGrowth.toFixed(1)}%`,
                clientGrowth: cGrowth >= 0 ? `+${cGrowth.toFixed(1)}%` : `${cGrowth.toFixed(1)}%`,
                retention: `${retentionRate.toFixed(1)}%`,
                yearly: (currSales * 52).toFixed(0)
            }
        };
    }, [sales]);

    return (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <button onClick={onBack} className="p-3 glass-card hover:bg-tea-50 text-tea-700 rounded-2xl border-tea-700/10"><ArrowLeft className="w-6 h-6" /></button>
                <div className="flex-1 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                    <div className="w-32 h-32 rounded-[2.5rem] border-4 border-tea-700/10 overflow-hidden">
                        <ImageWithFallback
                            src={stylist.imageUrl}
                            alt={stylist.name}
                            className="w-full h-full object-cover"
                            fallbackClassName="w-full h-full flex items-center justify-center p-8 text-tea-300 shrink-0"
                            FallbackComponent={User}
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h2 className="text-4xl font-black text-tea-900 uppercase tracking-tight">{stylist.name}</h2>
                            <p className="text-tea-500 font-bold text-xs uppercase tracking-widest">{stylist.email} | {stylist.phone}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            {stylist.skills?.split(',').map((s, i) => <span key={i} className="px-3 py-1 bg-tea-100/50 border border-tea-700/10 rounded-lg text-[9px] font-black text-tea-700 uppercase tracking-widest">{s.trim()}</span>)}
                        </div>
                        <p className="text-tea-600 text-sm italic font-bold max-w-xl">"{stylist.bio || 'Expert stylist dedicated to providing the best hair care experience.'}"</p>
                    </div>
                </div>
            </div>

            <div className="flex border-b border-tea-700/5 gap-8 overflow-x-auto no-scrollbar">
                {[
                    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                    { id: 'clients', label: 'Clients', icon: Users },
                    { id: 'sales', label: 'Sales', icon: Package },
                    { id: 'ai', label: 'AI Recommendations', icon: Bot }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 pb-4 border-b-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'border-tea-700 text-tea-700' : 'border-transparent text-tea-400'}`}>
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'analytics' && <AnalyticsPanel statsData={statsData} growthStats={growthStats} stylist={stylist} />}
                {activeTab === 'clients' && <RecordsTable type="clients" data={clients} />}
                {activeTab === 'sales' && <RecordsTable type="sales" data={sales} />}
                {activeTab === 'ai' && <AIRecommendationsPanel recommendations={recommendations} />}
            </div>
        </div>
    );
};

const AnalyticsPanel = ({ statsData, growthStats, stylist }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-6">
            <h3 className="text-lg font-black text-tea-900 uppercase tracking-tight mb-8">Performance History</h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={statsData}>
                        <defs><linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={themeColors.primary} stopOpacity={0.2} /><stop offset="95%" stopColor={themeColors.primary} stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={`${themeColors.primary}10`} vertical={false} />
                        <XAxis dataKey="name" stroke={themeColors.textMuted} fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke={themeColors.textMuted} fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="sales" stroke={themeColors.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="space-y-6">
            <StatCard label="Growth" value={growthStats.salesGrowth} growth={growthStats.salesGrowth} />
            <StatCard label="Retention" value={growthStats.retention} growth={growthStats.clientGrowth} />
            <StatCard label="Yearly" value={`$${Number(growthStats.yearly).toLocaleString()}`} growth={growthStats.salesGrowth} />
        </div>
    </div>
);

const StatCard = ({ label, value, growth }) => (
    <div className="glass-card p-6">
        <p className="text-[9px] font-black text-tea-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-tea-900 mt-1">{value}</p>
        <p className="text-[9px] text-emerald-600 font-black mt-2 uppercase flex items-center gap-1 tracking-widest"><ArrowUpRight className="w-3 h-3" /> {growth}</p>
    </div>
);

const RecordsTable = ({ type, data }) => (
    <div className="glass-card overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
                <thead className="table-header">
                    <tr>
                        <th className="text-left p-6 text-[10px] font-black text-tea-400 uppercase tracking-widest">{type === 'clients' ? 'Client' : 'Order ID / Client'}</th>
                        <th className="text-left p-6 text-[10px] font-black text-tea-400 uppercase tracking-widest">{type === 'clients' ? 'Contact' : 'Products'}</th>
                        <th className="text-left p-6 text-[10px] font-black text-tea-400 uppercase tracking-widest">{type === 'clients' ? 'Joined' : 'Qty'}</th>
                        <th className="text-center p-6 text-[10px] font-black text-tea-400 uppercase tracking-widest">Status</th>
                        <th className="text-right p-6 text-[10px] font-black text-tea-400 uppercase tracking-widest">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr><td colSpan="5" className="p-20 text-center text-tea-400 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Records...</td></tr>
                    ) : (
                        data.map(item => {
                            const isSale = type !== 'clients';
                            const status = isSale ? getSaleStatus(item) : 'Active';
                            const isActive = isSale ? isSaleActive(item) : true;
                            const amount = item.totalAmount || item.total || 0;

                            return (
                                <tr key={item.id} className="table-row">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-tea-700 flex items-center justify-center font-black text-white text-[10px]">
                                                {(item.clientName || item.name || 'U').charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-tea-900 uppercase">
                                                    {item.clientName || item.name || item.id?.substring(0, 8)}
                                                </p>
                                                {isSale && (
                                                    <span className="text-[9px] font-bold text-tea-400 uppercase tracking-wider block">
                                                        #{item.id?.substring(0, 8)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-[10px] text-tea-500 font-black uppercase tracking-widest">
                                        {type === 'clients' ? item.email : (item.products?.map(p => p.productName).join(', ') || 'Salon Product')}
                                    </td>
                                    <td className="p-6 text-[10px] text-tea-900 font-black uppercase tracking-widest">
                                        {type === 'clients' 
                                            ? new Date(item.joinDate?.toDate?.() || item.joinDate).toLocaleDateString() 
                                            : (item.products?.reduce((acc, p) => acc + (p.quantity || 1), 0) || 1)}
                                    </td>
                                    <td className="p-6 text-center">
                                        {status === 'Cancelled' && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                                                Cancelled
                                            </span>
                                        )}
                                        {status === 'Refunded' && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                                                Refunded
                                            </span>
                                        )}
                                        {status === 'Completed' && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                Completed
                                            </span>
                                        )}
                                        {type === 'clients' && (
                                            <span className="badge badge-success">ACTIVE</span>
                                        )}
                                    </td>
                                    <td className="p-6 text-right font-black">
                                        {type === 'clients' ? (
                                            <span className="text-tea-400 font-black text-xs">—</span>
                                        ) : !isActive ? (
                                            <div>
                                                <span className="line-through text-tea-400 text-xs block">${amount.toFixed(2)}</span>
                                                <span className="text-[10px] font-black text-red-600 uppercase tracking-tight">$0.00 Void</span>
                                            </div>
                                        ) : (
                                            <span className="text-tea-700 font-black">${amount.toFixed(2)}</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden flex flex-col gap-4 p-4 bg-tea-50/20">
            {data.length === 0 ? (
                <div className="p-10 text-center text-tea-400 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Records...</div>
            ) : (
                data.map(item => {
                    const isSale = type !== 'clients';
                    const status = isSale ? getSaleStatus(item) : 'Active';
                    const isActive = isSale ? isSaleActive(item) : true;
                    const amount = item.totalAmount || item.total || 0;

                    return (
                        <div key={item.id} className="glass-card p-4 space-y-4">
                            <div className="flex items-center justify-between border-b border-tea-700/10 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-tea-700 flex items-center justify-center font-black text-white text-[10px]">
                                        {(item.clientName || item.name || 'U').charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-tea-900 uppercase tracking-tight">
                                            {item.clientName || item.name || item.id?.substring(0, 8)}
                                        </p>
                                        {isSale && (
                                            <span className="text-[9px] font-bold text-tea-400 uppercase tracking-wider block">
                                                #{item.id?.substring(0, 8)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right font-black">
                                    {type === 'clients' ? (
                                        <span className="badge badge-success">ACTIVE</span>
                                    ) : !isActive ? (
                                        <div>
                                            <span className="line-through text-tea-400 text-xs block">${amount.toFixed(2)}</span>
                                            <span className="text-xs font-black text-red-600 uppercase tracking-tight">$0.00 Void</span>
                                        </div>
                                    ) : (
                                        <span className="text-lg tracking-tighter text-tea-700">${amount.toFixed(2)}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                                <div className="text-[10px] text-tea-500 font-black uppercase tracking-widest">
                                    {type === 'clients' ? item.email : (item.products?.map(p => p.productName).join(', ') || 'Salon Product')}
                                </div>
                                {isSale && (
                                    <div>
                                        {status === 'Cancelled' && (
                                            <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                                                Cancelled
                                            </span>
                                        )}
                                        {status === 'Refunded' && (
                                            <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                                                Refunded
                                            </span>
                                        )}
                                        {status === 'Completed' && (
                                            <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                Completed
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-tea-700/5">
                                <div className="text-[10px] text-tea-900 font-black uppercase tracking-widest">
                                    {type === 'clients' 
                                        ? new Date(item.joinDate?.toDate?.() || item.joinDate).toLocaleDateString() 
                                        : `Qty: ${item.products?.reduce((acc, p) => acc + (p.quantity || 1), 0) || 1}`}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    </div>
);

const AIRecommendationsPanel = ({ recommendations }) => {
    const [selectedRec, setSelectedRec] = useState(null);

    // Helper to safely format condition without ever displaying raw "UNKNOWN"
    const getDisplayCondition = (rec) => {
        const raw = rec.hairAnalysis?.condition;
        if (raw && raw.toLowerCase() !== 'unknown') return raw;
        const hyd = rec.hairAnalysis?.metrics?.find(m => m.label?.toLowerCase() === 'hydration')?.value;
        if (hyd && hyd < 60) return 'Dry / Dehydrated';
        if (hyd && hyd < 80) return 'Hydration Balance Needed';
        if (hyd) return 'Healthy / Balanced';
        return rec.suggestedProducts?.[0]?.productName ? 'Targeted Moisture Care' : 'Balanced';
    };

    // Helper to safely format hair type without displaying "UNKNOWN"
    const getDisplayType = (rec) => {
        const raw = rec.hairAnalysis?.type;
        if (raw && raw.toLowerCase() !== 'unknown') return raw;
        return 'Normal / Medium Texture';
    };

    // Helper to extract clean summary recommendation text
    const getSummaryText = (rec) => {
        if (rec.recommendation && rec.recommendation.toLowerCase() !== 'unknown') {
            return rec.recommendation;
        }
        const firstProd = rec.suggestedProducts?.[0];
        if (firstProd?.productName) {
            return `${firstProd.productName}${firstProd.reason ? ` — ${firstProd.reason}` : ''}`;
        }
        return `Hair Care Focus: ${getDisplayCondition(rec)}`;
    };

    return (
        <div className="space-y-6">
            {recommendations.length === 0 ? (
                <div className="py-20 text-center glass-card border-dashed border-tea-700/20">
                    <Bot className="w-12 h-12 text-tea-200 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-tea-400 uppercase tracking-[0.3em]">No Intelligence Collected Yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {recommendations.map(rec => {
                        const rawDate = rec.date || rec.createdAt?.toDate?.() || rec.createdAt;
                        const formattedDate = rawDate
                            ? new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'Recent';

                        const condition = getDisplayCondition(rec);
                        const hairType = getDisplayType(rec);
                        const hasSale = Boolean(rec.saleId || rec.productsSold > 0 || rec.suggestedProducts?.some(p => p.sold));
                        const suggestedProducts = rec.suggestedProducts || [];
                        const primaryProduct = suggestedProducts[0];

                        return (
                            <div
                                key={rec.id}
                                onClick={() => setSelectedRec(rec)}
                                className="glass-card p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 border-l-4 border-tea-600 cursor-pointer group hover:-translate-y-0.5"
                            >
                                <div className="space-y-4">
                                    {/* Top Meta Bar */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-tea-100 flex items-center justify-center text-tea-700 shrink-0 group-hover:scale-105 transition-transform">
                                                <Bot className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-tea-900 text-sm uppercase tracking-tight">
                                                    {rec.clientName || 'Private Client'}
                                                </h4>
                                                <span className="text-[9px] font-bold text-tea-400 uppercase tracking-widest">
                                                    {formattedDate}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Sale / Sold Badge */}
                                        {hasSale ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm shrink-0">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                Sale Completed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-tea-50 text-tea-600 border border-tea-200/50 shrink-0">
                                                <Sparkles className="w-3 h-3 text-tea-500" />
                                                Recommended
                                            </span>
                                        )}
                                    </div>

                                    {/* Recommended Product Headline */}
                                    <div className="bg-tea-50/50 rounded-xl p-3.5 border border-tea-700/10 space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <ShoppingBag className="w-3.5 h-3.5 text-tea-700" />
                                                <span className="text-[10px] font-black text-tea-900 uppercase tracking-wider">
                                                    {primaryProduct?.productName || 'Personalized Product Recommendation'}
                                                </span>
                                            </div>
                                            {primaryProduct?.score !== undefined && (
                                                <span className="px-2 py-0.5 rounded text-[8px] font-black bg-tea-200/60 text-tea-800">
                                                    {Math.round(primaryProduct.score * 100)}% Match
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-tea-600 font-medium leading-relaxed line-clamp-2">
                                            {getSummaryText(rec)}
                                        </p>
                                    </div>

                                    {/* Hair Health & Metrics Pills */}
                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                        <span className="px-2.5 py-1 bg-white border border-tea-200 rounded-lg text-[9px] font-bold text-tea-800 tracking-wide">
                                            Condition: <span className="font-black text-tea-900">{condition}</span>
                                        </span>
                                        <span className="px-2.5 py-1 bg-white border border-tea-200 rounded-lg text-[9px] font-bold text-tea-800 tracking-wide">
                                            Type: <span className="font-black text-tea-900">{hairType}</span>
                                        </span>

                                        {rec.hairAnalysis?.metrics?.map((m, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-tea-100/60 text-tea-800 rounded-lg text-[9px] font-black">
                                                {m.label}: {m.value}%
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer action */}
                                <div className="mt-4 pt-3 border-t border-tea-700/10 flex items-center justify-between text-tea-600 text-[10px] font-black uppercase tracking-widest group-hover:text-tea-800">
                                    <span>{suggestedProducts.length} Product{suggestedProducts.length !== 1 ? 's' : ''} Analyzed</span>
                                    <span className="inline-flex items-center gap-1">
                                        View Full Analysis <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Comprehensive AI Recommendation Details Modal */}
            {selectedRec && (
                <AIRecommendationDetailModal
                    rec={selectedRec}
                    condition={getDisplayCondition(selectedRec)}
                    hairType={getDisplayType(selectedRec)}
                    onClose={() => setSelectedRec(null)}
                />
            )}
        </div>
    );
};

// Comprehensive Modal component for full AI Recommendation details matching the mobile app
const AIRecommendationDetailModal = ({ rec, condition, hairType, onClose }) => {
    const rawDate = rec.date || rec.createdAt?.toDate?.() || rec.createdAt;
    const formattedDate = rawDate
        ? new Date(rawDate).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'Recent Session';

    const suggestedProducts = rec.suggestedProducts || [];
    const metrics = rec.hairAnalysis?.metrics || [];
    const hasSale = Boolean(rec.saleId || rec.productsSold > 0 || suggestedProducts.some(p => p.sold));

    return (
        <div className="fixed inset-0 bg-tea-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="glass-card max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar border-tea-700/10 shadow-2xl relative">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-tea-700/10 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-tea-100 flex items-center justify-center text-tea-700 shrink-0">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-tea-900 uppercase tracking-tight">
                                    {rec.clientName || 'Client Recommendation'}
                                </h3>
                                {rec.id && (
                                    <span className="text-[9px] font-mono bg-tea-100 px-2 py-0.5 rounded text-tea-700">
                                        #{rec.id.replace('rec-', '')}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-tea-500 font-bold tracking-wide mt-0.5">
                                Stylist: <span className="text-tea-800">{rec.stylistName || 'Salon Team'}</span> · {formattedDate}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-tea-400 hover:text-tea-700 hover:bg-tea-100/50 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sale Information Card (If Sold) */}
                {hasSale && (
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h5 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                                    Product Sale Completed
                                </h5>
                                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                                    This recommendation directly converted into a completed client sale.
                                </p>
                            </div>
                        </div>
                        {rec.saleId && (
                            <span className="text-[10px] font-mono font-bold bg-white px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-800 shrink-0">
                                Order: {rec.saleId}
                            </span>
                        )}
                    </div>
                )}

                {/* Suggested Products List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-tea-900 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-tea-700" />
                            Recommended Products ({suggestedProducts.length})
                        </h4>
                    </div>

                    <div className="space-y-3">
                        {suggestedProducts.map((prod, idx) => (
                            <div key={idx} className="bg-white rounded-xl border border-tea-200/80 p-4 space-y-3 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h5 className="font-black text-sm text-tea-900">
                                            {prod.productName}
                                        </h5>
                                        {prod.productId && (
                                            <p className="text-[9px] font-mono text-tea-400 mt-0.5">ID: {prod.productId}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {prod.score !== undefined && (
                                            <span className="px-2.5 py-1 rounded-md text-[9px] font-black bg-tea-100 text-tea-800">
                                                {Math.round(prod.score * 100)}% Match
                                            </span>
                                        )}
                                        {prod.sold ? (
                                            <span className="px-2.5 py-1 rounded-md text-[9px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Sold
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-md text-[9px] font-black bg-tea-50 text-tea-600 border border-tea-200/50">
                                                Suggested
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {prod.reason && (
                                    <div className="text-xs text-tea-700 bg-tea-50/60 p-2.5 rounded-lg leading-relaxed">
                                        <span className="font-bold text-tea-900">Why recommended: </span>
                                        {prod.reason}
                                    </div>
                                )}

                                {prod.stylistScript && (
                                    <div className="text-xs text-tea-600 italic bg-tea-100/30 p-2.5 rounded-lg border-l-2 border-tea-600 leading-relaxed">
                                        <span className="font-bold not-italic text-tea-800">Stylist Talking Points: </span>
                                        "{prod.stylistScript}"
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hair Analysis & Health Diagnostics */}
                <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-tea-900 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-tea-700" />
                        Hair Health Diagnostic Metrics
                    </h4>

                    {/* Condition & Type Summary */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-tea-200/80">
                            <p className="text-[9px] font-black uppercase tracking-wider text-tea-400">Identified Condition</p>
                            <p className="text-sm font-black text-tea-900 mt-1">{condition}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-tea-200/80">
                            <p className="text-[9px] font-black uppercase tracking-wider text-tea-400">Hair Texture / Type</p>
                            <p className="text-sm font-black text-tea-900 mt-1">{hairType}</p>
                        </div>
                    </div>

                    {/* Metrics Bars */}
                    {metrics.length > 0 && (
                        <div className="bg-white rounded-xl border border-tea-200/80 p-4 space-y-3">
                            {metrics.map((m, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-black text-tea-900">{m.label}</span>
                                        <span className="font-bold text-tea-700">
                                            {m.value}% {m.level ? `(${m.level})` : ''}
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-tea-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-tea-500 to-tea-700 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.max(0, m.value || 0))}%` }}
                                        />
                                    </div>
                                    {m.explanation && (
                                        <p className="text-[10px] text-tea-500 font-medium leading-relaxed">
                                            {m.explanation}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end pt-4 border-t border-tea-700/10">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-tea-700 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-tea-800 transition-colors"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

const StylistModal = ({ mode, stylist, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', status: 'Active', bio: '', skills: '', password: '', imageUrl: '',
        ...stylist
    });
    return (
        <div className="fixed inset-0 bg-tea-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="glass-card max-w-2xl w-full p-8 space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar border-tea-700/10 shadow-2xl">
                <h2 className="text-3xl font-black text-tea-900 uppercase tracking-tighter">{mode === 'add' ? 'New' : 'Edit'} <span className="text-tea-700">Stylist</span></h2>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Full Name" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
                        <InputGroup label="Email" type="email" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} />
                        <InputGroup label="Phone" value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} />
                        <InputGroup
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={v => setFormData({ ...formData, password: v })}
                            placeholder={mode === 'edit' ? 'Leave blank to keep current' : 'Min. 8 characters'}
                            required={mode === 'add'}
                        />
                    </div>
                    <div className="flex flex-col items-center gap-4 py-4 border-y border-tea-700/5">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-2 border-dashed border-tea-700/20 group-hover:border-tea-700/50 transition-colors">
                                <ImageWithFallback
                                    src={formData.imageUrl}
                                    className="w-full h-full object-cover"
                                    fallbackClassName="w-full h-full flex flex-col items-center justify-center bg-white/50 text-tea-400 p-6 shrink-0"
                                    FallbackComponent={User}
                                />
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-tea-900/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[2.5rem]">
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const url = await uploadImage(file, `stylists/${Date.now()}_${file.name}`);
                                            setFormData({ ...formData, imageUrl: url });
                                        }
                                    }}
                                />
                                <Upload className="w-6 h-6 text-white" />
                            </label>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black text-tea-700 uppercase tracking-widest leading-none">Stylist Portrait</p>
                            <p className="text-[9px] text-tea-400 mt-1 uppercase font-bold">Click to upload photo</p>
                        </div>
                    </div>
                    <InputGroup label="Professional Skills" value={formData.skills} onChange={v => setFormData({ ...formData, skills: v })} placeholder="Coloring, Styling, etc." />
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-tea-700 uppercase tracking-widest ml-1">Biography</label>
                        <textarea className="input-field min-h-[100px] py-3 bg-white/50" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
                        <button type="submit" className="flex-1 btn-primary">Save Member</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputGroup = ({ label, type = "text", value, onChange, placeholder, required = true }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-tea-700 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative">
                <input
                    type={isPassword ? (showPassword ? "text" : "password") : type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="input-field bg-white/50 pr-12"
                    placeholder={placeholder}
                    required={required}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-tea-400 hover:text-tea-700 transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Stylists;
