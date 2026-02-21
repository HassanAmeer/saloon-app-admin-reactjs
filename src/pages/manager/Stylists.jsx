import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Eye,
    User,
    UserX,
    Check,
    X,
    Loader2,
    Users,
    TrendingUp,
    Package,
    Sparkles,
    Settings,
    ArrowUpRight,
    Camera,
    Upload,
    ArrowLeft,
    Mail,
    Phone,
    Briefcase,
    Calendar
} from 'lucide-react';
import {
    subscribeToCollection,
    createDocument,
    updateDocument,
    uploadImage
} from '../../lib/services';
import { useAuth } from '../../contexts/AuthContext';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

import { useSearchParams } from 'react-router-dom';
import ImageWithFallback from '../../components/ImageWithFallback';

const Stylists = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [stylists, setStylists] = useState([]);
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
        const unsubscribe = subscribeToCollection(`salons/${salonId}/stylists`, (data) => {
            setStylists(data);
            setLoading(false);
        }, [], { field: 'createdAt', direction: 'desc' });

        return () => unsubscribe();
    }, [salonId]);

    const filteredStylists = stylists.filter(stylist => {
        const matchesSearch = stylist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stylist.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || stylist.status?.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleSave = async (data) => {
        try {
            const folderPath = `salons/${user.salonId}/stylists`;
            if (modalMode === 'add') {
                await createDocument(folderPath, {
                    ...data,
                    salonId: user.salonId,
                    totalSales: 0,
                    unitsSold: 0,
                    clientsCount: 0,
                    scansCount: 0,
                    createdAt: new Date()
                });
            } else {
                const updateData = { ...data };
                if (!updateData.password) delete updateData.password;
                await updateDocument(folderPath, selectedStylist.id, updateData);
            }
            setShowModal(false);
        } catch (error) {
            console.error(error);
            alert("Error saving stylist");
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-10 h-10 text-tea-700 animate-spin" /></div>;

    if (viewingDetail && selectedStylist) {
        return <StylistDetail stylist={selectedStylist} onBack={() => setViewingDetail(false)} />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-tea-900 tracking-tight">Team <span className="text-tea-700">Stylists</span></h1>
                    <p className="text-tea-500 font-bold text-xs uppercase tracking-widest leading-none">Manage specialist profiles and monitor performance</p>
                </div>
                <button onClick={() => { setModalMode('add'); setSelectedStylist(null); setShowModal(true); }} className="btn-primary">
                    <Plus className="w-5 h-5" />
                    <span>Register Specialist</span>
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
                {filteredStylists.map((stylist) => (
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
                                    <StatMini label="Sales" value={`$${stylist.totalSales || 0}`} />
                                    <StatMini label="Clients" value={stylist.clientsCount || 0} />
                                    <StatMini label="Units" value={stylist.unitsSold || 0} />
                                    <StatMini label="Scans" value={stylist.scansCount || 0} />
                                </div>
                                <div className="flex gap-2 pt-4 border-t border-tea-700/5">
                                    <button onClick={() => { setSelectedStylist(stylist); setViewingDetail(true); }} className="flex-1 btn-secondary text-[10px] font-black uppercase tracking-widest"><Eye className="w-4 h-4" /> View Details</button>
                                    <button onClick={() => { setSelectedStylist(stylist); setModalMode('edit'); setShowModal(true); }} className="p-2 btn-secondary"><Edit className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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

const StylistDetail = ({ stylist, onBack }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('analytics');
    const [clients, setClients] = useState([]);
    const [sales, setSales] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        if (!stylist.id || !user?.salonId) return;

        const unsubs = [
            subscribeToCollection(`salons/${user.salonId}/stylists/${stylist.id}/clients`, setClients),
            subscribeToCollection(`salons/${user.salonId}/sales`, setSales, [{ field: 'stylistId', operator: '==', value: stylist.id }]),
            subscribeToCollection(`salons/${user.salonId}/stylists/${stylist.id}/Ai recommendations`, setRecommendations, [], { field: 'createdAt', direction: 'desc' })
        ];
        return () => unsubs.forEach(u => u());
    }, [stylist.id, user?.salonId]);

    const statsData = [
        { name: 'Mon', sales: 400, clients: 24 },
        { name: 'Tue', sales: 300, clients: 13 },
        { name: 'Wed', sales: 500, clients: 98 },
        { name: 'Thu', sales: 278, clients: 39 },
        { name: 'Fri', sales: 189, clients: 48 },
        { name: 'Sat', sales: 239, clients: 38 },
        { name: 'Sun', sales: 349, clients: 43 },
    ];

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
                    { id: 'ai', label: 'AI Recommendations', icon: Sparkles }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 pb-4 border-b-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'border-tea-700 text-tea-700' : 'border-transparent text-tea-400'}`}>
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'analytics' && <AnalyticsPanel statsData={statsData} stylist={stylist} />}
                {activeTab === 'clients' && <RecordsTable type="clients" data={clients} />}
                {activeTab === 'sales' && <RecordsTable type="sales" data={sales} />}
                {activeTab === 'ai' && <AIRecommendationsPanel recommendations={recommendations} />}
            </div>
        </div>
    );
};

const AnalyticsPanel = ({ statsData, stylist }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
            <h3 className="text-lg font-black text-tea-900 uppercase tracking-tight mb-8">Performance History</h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={statsData}>
                        <defs><linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B4513" stopOpacity={0.2} /><stop offset="95%" stopColor="#8B4513" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#8B451305" vertical={false} />
                        <XAxis dataKey="name" stroke="#8b6f5c" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#8b6f5c" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="sales" stroke="#8B4513" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="space-y-6">
            <StatCard label="Growth" value="+24%" growth="+5%" />
            <StatCard label="Retention" value="92%" growth="+2%" />
            <StatCard label="Yearly" value={`$${(stylist.totalSales * 1.2 || 0).toFixed(0)}`} growth="+15%" />
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
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="table-header">
                    <tr>
                        <th className="text-left p-6 text-[10px] font-black text-tea-400 uppercase tracking-widest">{type === 'clients' ? 'Client' : 'Order ID'}</th>
                        <th className="text-left p-6 text-[10px] font-black text-tea-400 uppercase tracking-widest">{type === 'clients' ? 'Contact' : 'Products'}</th>
                        <th className="text-left p-6 text-[10px] font-black text-tea-400 uppercase tracking-widest">{type === 'clients' ? 'Joined' : 'Qty'}</th>
                        <th className="text-right p-6 text-[10px] font-black text-tea-400 uppercase tracking-widest">{type === 'clients' ? 'Status' : 'Amount'}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr><td colSpan="4" className="p-20 text-center text-tea-400 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Records...</td></tr>
                    ) : (
                        data.map(item => (
                            <tr key={item.id} className="table-row">
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-tea-700 flex items-center justify-center font-black text-white text-[10px]">{item.name?.charAt(0) || 'U'}</div>
                                        <p className="text-sm font-black text-tea-900 uppercase">{item.name || item.id.substring(0, 8)}</p>
                                    </div>
                                </td>
                                <td className="p-6 text-[10px] text-tea-500 font-black uppercase tracking-widest">{type === 'clients' ? item.email : item.products?.map(p => p.productName).join(', ')}</td>
                                <td className="p-6 text-[10px] text-tea-900 font-black uppercase tracking-widest">{type === 'clients' ? new Date(item.joinDate?.toDate?.() || item.joinDate).toLocaleDateString() : '1'}</td>
                                <td className="p-6 text-right font-black text-tea-700">
                                    {type === 'clients' ? <span className="badge badge-success">ACTIVE</span> : `$${(item.totalAmount || item.total || 0).toFixed(2)}`}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const AIRecommendationsPanel = ({ recommendations }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.length === 0 ? (
            <div className="col-span-2 py-20 text-center glass-card border-dashed border-tea-700/20">
                <Sparkles className="w-12 h-12 text-tea-200 mx-auto mb-4" />
                <p className="text-[10px] font-black text-tea-400 uppercase tracking-[0.3em]">No Intelligence Collected Yet</p>
            </div>
        ) : (
            recommendations.map(rec => (
                <div key={rec.id} className="glass-card p-6 flex gap-6 items-center border-l-4 border-tea-700">
                    <div className="w-12 h-12 rounded-xl bg-tea-100 flex items-center justify-center text-tea-700">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-black text-tea-900 text-[10px] uppercase tracking-widest">{rec.title || 'Growth Opportunity'}</h4>
                            <span className="text-[8px] font-black text-tea-400 uppercase">{new Date(rec.createdAt?.toDate?.() || rec.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[10px] text-tea-500 font-bold uppercase tracking-widest mt-1 leading-relaxed">
                            {rec.recommendation || `Recommended treatment for ${rec.clientName || 'Client'} based on scan.`}
                        </p>
                    </div>
                </div>
            ))
        )}
    </div>
);

const StylistModal = ({ mode, stylist, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', status: 'Active', bio: '', skills: '', password: '', imageUrl: '',
        ...stylist
    });
    return (
        <div className="fixed inset-0 bg-tea-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="glass-card max-w-2xl w-full p-8 space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar border-tea-700/10 shadow-2xl">
                <h2 className="text-3xl font-black text-tea-900 uppercase tracking-tighter">{mode === 'add' ? 'New' : 'Edit'} <span className="text-tea-700">Specialist</span></h2>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Full Name" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
                        <InputGroup label="Email" type="email" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} />
                        <InputGroup label="Phone" value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} />
                        <InputGroup label="Password" type="password" value={formData.password} onChange={v => setFormData({ ...formData, password: v })} placeholder={mode === 'edit' ? 'Optional' : ''} />
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
                            <p className="text-[10px] font-black text-tea-700 uppercase tracking-widest leading-none">Specialist Portrait</p>
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

const InputGroup = ({ label, type = "text", value, onChange, placeholder }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-tea-700 uppercase tracking-widest ml-1">{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} className="input-field bg-white/50" placeholder={placeholder} required={type !== 'password'} />
    </div>
);

export default Stylists;
