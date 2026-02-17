import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Eye,
    Trash2,
    Check,
    X,
    Loader2,
    Building2,
    Mail,
    Phone,
    ArrowRight,
    MapPin
} from 'lucide-react';
import {
    subscribeToCollection,
    createDocument,
    updateDocument
} from '../lib/services';
import { useNavigate } from 'react-router-dom';

const Managers = () => {
    const navigate = useNavigate();
    const [managers, setManagers] = useState([]);
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedManager, setSelectedManager] = useState(null);

    useEffect(() => {
        const unsubs = [
            subscribeToCollection('salon_managers', setManagers),
            subscribeToCollection('salons', setSalons)
        ];

        const timeout = setTimeout(() => setLoading(false), 1000);
        return () => {
            unsubs.forEach(unsub => unsub());
            clearTimeout(timeout);
        };
    }, []);

    const filteredManagers = managers.filter(m =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        setModalMode('add');
        setSelectedManager(null);
        setShowModal(true);
    };

    const handleEdit = (manager) => {
        setModalMode('edit');
        setSelectedManager(manager);
        setShowModal(true);
    };

    const handleSave = async (data) => {
        try {
            if (modalMode === 'add') {
                const managerRes = await createDocument('salon_managers', {
                    ...data.manager,
                    role: 'manager',
                    status: 'Active',
                    createdAt: new Date()
                });

                const newSalonId = managerRes.id;

                await createDocument('salons', {
                    ...data.salon,
                    id: newSalonId,
                    managerId: managerRes.id,
                    createdAt: new Date(),
                    supportEmail: 'support@saloon.com',
                    supportPhone: '+0123456789'
                });

                const { mockConfig } = await import('../data-migration/mockData');
                await createDocument('settings', {
                    ...mockConfig,
                    salonId: newSalonId,
                    id: `app_config_${newSalonId}`,
                    supportEmail: 'support@saloon.com',
                    supportPhone: '+0123456789'
                });

                const defaultProducts = [
                    {
                        name: 'Argan Oil Elixir',
                        brand: 'Luxe Hair',
                        category: 'Treatment',
                        description: 'Premium hydration and shine elixir',
                        price: 45.00,
                        salonId: newSalonId,
                        active: true,
                        imageUrl: 'https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?w=300'
                    },
                    {
                        name: 'Silver Bright Shampoo',
                        brand: 'Pure Color',
                        category: 'Shampoo',
                        description: 'For platinum and silver hair maintenance',
                        price: 32.00,
                        salonId: newSalonId,
                        active: true,
                        imageUrl: 'https://images.unsplash.com/photo-1543946602-a0fce8117697?w=300'
                    }
                ];

                for (const p of defaultProducts) {
                    await createDocument('products', p);
                }

            } else {
                await updateDocument('salon_managers', selectedManager.id, data.manager);
            }
            setShowModal(false);
        } catch (error) {
            console.error("Error saving:", error);
            alert("Partner onboarding failed.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-tea-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-tea-900 tracking-tight">Salon <span className="text-tea-700">Managers</span></h1>
                    <p className="text-tea-500 font-medium tracking-wide">Manage platform partners and their salon entities</p>
                </div>
                <button onClick={handleAdd} className="btn-primary">
                    <Plus className="w-5 h-5" />
                    <span>Onboard New Partner</span>
                </button>
            </div>

            <div className="glass-card p-4 relative border-none">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-tea-400" />
                <input
                    type="text"
                    placeholder="Search by name, email, or salon entity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-14"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredManagers.map((manager) => {
                    const salon = salons.find(s => s.managerId === manager.id);
                    return (
                        <div key={manager.id} className="glass-card overflow-hidden group hover:shadow-xl hover:shadow-tea-900/5 transition-all">
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-tea-100 border border-tea-200 flex items-center justify-center text-2xl font-black text-tea-700 uppercase">
                                            {manager.imageUrl ? (
                                                <img src={manager.imageUrl} alt={manager.name} className="w-full h-full object-cover rounded-2xl" />
                                            ) : manager.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-tea-900 uppercase tracking-tight">{manager.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="badge badge-success">{manager.status}</span>
                                                <span className="text-tea-400 text-xs font-bold uppercase tracking-widest">{manager.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(manager)} className="p-2 glass-card hover:bg-tea-50 text-tea-400 hover:text-tea-700 transition-all border-none shadow-none"><Edit className="w-4 h-4" /></button>
                                        <button className="p-2 glass-card hover:bg-rose-50 text-tea-400 hover:text-rose-500 transition-all border-none shadow-none"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>

                                {salon && (
                                    <div className="p-5 bg-tea-50/50 rounded-2xl border border-tea-100 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="w-5 h-5 text-tea-600" />
                                            <div>
                                                <p className="text-[10px] font-black text-tea-400 uppercase tracking-widest">Linked Salon Entity</p>
                                                <p className="text-sm font-bold text-tea-900 uppercase tracking-tight">{salon.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-tea-400" />
                                                <span className="text-[10px] font-bold text-tea-500 uppercase tracking-widest leading-none">{salon.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-tea-100">
                                    <div className="flex gap-6">
                                        <div className="text-center">
                                            <p className="text-sm font-black text-tea-900">--</p>
                                            <p className="text-[8px] font-black text-tea-400 uppercase tracking-widest">Stylists</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-black text-tea-900">$0.00</p>
                                            <p className="text-[8px] font-black text-tea-400 uppercase tracking-widest">Revenue</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/super/dashboard?salonId=${salon?.id}`)}
                                        className="btn-secondary py-2 text-[10px] font-black uppercase tracking-[0.2em] group"
                                    >
                                        Monitor Salon <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <ManagerModal
                    mode={modalMode}
                    manager={selectedManager}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

const ManagerModal = ({ mode, manager, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        manager: {
            name: '',
            email: '',
            password: '',
            ...manager
        },
        salon: {
            name: '',
            address: '',
            phone: ''
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-tea-900/20 backdrop-blur-md flex items-center justify-center z-[100] p-4 font-sans">
            <div className="glass-card max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col scale-in bg-white border-none shadow-2xl">
                <div className="p-8 border-b border-tea-100 flex justify-between items-center bg-gradient-to-r from-tea-50 to-white">
                    <h2 className="text-2xl font-black text-tea-900 tracking-tight uppercase">{mode === 'add' ? 'Partner Onboarding' : 'Edit Partner'}</h2>
                    <button onClick={onClose} className="text-tea-400 hover:text-tea-700 transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto no-scrollbar space-y-8">
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-tea-600 uppercase tracking-[0.2em] flex items-center gap-2">
                            <div className="w-1 h-3 bg-tea-600 rounded-full" /> Personal Credentials
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-tea-800 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    className="input-field"
                                    value={formData.manager.name}
                                    onChange={e => setFormData({ ...formData, manager: { ...formData.manager, name: e.target.value } })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-tea-800 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    className="input-field"
                                    type="email"
                                    value={formData.manager.email}
                                    onChange={e => setFormData({ ...formData, manager: { ...formData.manager, email: e.target.value } })}
                                    required
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black text-tea-800 uppercase tracking-widest ml-1">Login Password</label>
                                <input
                                    className="input-field"
                                    type="password"
                                    value={formData.manager.password}
                                    onChange={e => setFormData({ ...formData, manager: { ...formData.manager, password: e.target.value } })}
                                    required={mode === 'add'}
                                    placeholder={mode === 'edit' ? "Leave blank to keep current" : "Min. 6 characters"}
                                />
                            </div>
                        </div>
                    </div>

                    {mode === 'add' && (
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-tea-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                <div className="w-1 h-3 bg-tea-600 rounded-full" /> Salon Entity Registration
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-tea-800 uppercase tracking-widest ml-1">Salon Brand Name</label>
                                    <input
                                        className="input-field"
                                        value={formData.salon.name}
                                        onChange={e => setFormData({ ...formData, salon: { ...formData.salon, name: e.target.value } })}
                                        placeholder="e.g. Elegance Studio"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-tea-800 uppercase tracking-widest ml-1">Physical Location</label>
                                    <input
                                        className="input-field"
                                        value={formData.salon.address}
                                        onChange={e => setFormData({ ...formData, salon: { ...formData.salon, address: e.target.value } })}
                                        placeholder="Full address here"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                        <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
                        <button type="submit" className="flex-1 btn-primary">Complete Onboarding</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Managers;
