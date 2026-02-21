import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import {
    Plus,
    Search,
    Edit,
    Eye,
    EyeOff,
    Trash2,
    Check,
    X,
    Loader2,
    Building2,
    ArrowRight,
    MapPin,
    User,
    Camera,
    Upload
} from 'lucide-react';
import {
    subscribeToCollection,
    createDocument,
    updateDocument,
    deleteDocument,
    uploadImage
} from '../../lib/services';
import { useNavigate } from 'react-router-dom';
import { ManagersSkeleton } from '../../components/Skeleton';
import ImageWithFallback from '../../components/ImageWithFallback';

const Managers = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [managers, setManagers] = useState([]);
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
        navigate('/super/managers/new');
    };

    const handleEdit = (manager) => {
        navigate(`/super/managers/edit/${manager.id}`);
    };

    const handleDelete = async (managerId) => {
        if (!window.confirm("Are you sure you want to delete this partner? This will also remove their linked salon entity.")) return;

        try {
            // Find associated salon
            const salon = salons.find(s => s.managerId === managerId);

            // Delete manager
            await deleteDocument('salon_managers', managerId);

            // Delete associated salon if exists
            if (salon) {
                await deleteDocument('salons', salon.id);
            }
            showToast('Partner deleted successfully', 'success');
        } catch (error) {
            console.error("Error deleting:", error);
            showToast('Failed to delete partner', 'error');
        }
    };



    if (loading) {
        return <ManagersSkeleton />;
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
                                        <div className="w-16 h-16 rounded-2xl bg-tea-100 border border-tea-200 flex items-center justify-center text-2xl font-black text-tea-700 uppercase overflow-hidden">
                                            <ImageWithFallback
                                                src={manager.imageUrl}
                                                alt={manager.name}
                                                className="w-full h-full object-cover rounded-2xl"
                                                fallbackClassName="w-full h-full flex items-center justify-center p-4 text-tea-300 shrink-0"
                                                FallbackComponent={User}
                                            />
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
                                        <button
                                            onClick={() => handleDelete(manager.id)}
                                            className="p-2 glass-card hover:bg-rose-50 text-tea-400 hover:text-rose-500 transition-all border-none shadow-none"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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
                                        onClick={() => navigate(`/manager/dashboard?salonId=${salon?.id}`)}
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

        </div>
    );
};



export default Managers;
