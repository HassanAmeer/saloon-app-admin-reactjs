import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Loader2,
    Camera,
    User,
    Building2,
    Save
} from 'lucide-react';
import {
    getDocument,
    createDocument,
    updateDocument,
    uploadImage
} from '../../lib/services';
import { useNavigate, useParams } from 'react-router-dom';
import ImageWithFallback from '../../components/ImageWithFallback';
import { ManagerFormSkeleton } from '../../components/Skeleton';

const ManagerForm = ({ mode }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(mode === 'edit');
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [salonId, setSalonId] = useState(null);

    const [formData, setFormData] = useState({
        manager: {
            name: '',
            email: '',
            phone: '',
            bio: '',
            brand: '',
            address: '',
            password: '',
            imageUrl: ''
        },
        salon: {
            name: '',
            address: '',
            phone: ''
        }
    });

    useEffect(() => {
        if (mode === 'edit' && id) {
            const fetchData = async () => {
                try {
                    const managerData = await getDocument('salon_managers', id);
                    if (managerData) {
                        setFormData(prev => ({
                            ...prev,
                            manager: { ...prev.manager, ...managerData, password: '' }
                        }));
                        setPreviewUrl(managerData.imageUrl || null);

                        if (managerData.salonId) {
                            setSalonId(managerData.salonId);
                            const salonData = await getDocument('salons', managerData.salonId);
                            if (salonData) {
                                setFormData(prev => ({
                                    ...prev,
                                    salon: { ...prev.salon, ...salonData }
                                }));
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                    showToast('Failed to load partner data', 'error');
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [id, mode, showToast]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            let finalData = { ...formData };
            if (selectedFile) {
                const url = await uploadImage(selectedFile, `managers/${Date.now()}`);
                if (url) {
                    finalData.manager.imageUrl = url;
                }
            }

            if (mode === 'add') {
                const managerRes = await createDocument('salon_managers', {
                    ...finalData.manager,
                    type: 'salonmanager',
                    status: 'Active',
                    createdAt: new Date()
                });

                const newSalonId = managerRes.id;

                await updateDocument('salon_managers', managerRes.id, {
                    salonId: newSalonId
                });

                await createDocument('salons', {
                    ...finalData.salon,
                    id: newSalonId,
                    managerId: managerRes.id,
                    createdAt: new Date(),
                    supportEmail: 'support@salon.com',
                    supportPhone: '+0123456789'
                });

                const { mockConfig } = await import('../../data-migration/mockData');
                await createDocument('settings', {
                    ...mockConfig,
                    salonId: newSalonId,
                    id: `app_config_${newSalonId}`,
                    supportEmail: 'support@salon.com',
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
                const updatePayload = { ...finalData.manager };
                if (!updatePayload.password) delete updatePayload.password;

                await updateDocument('salon_managers', id, updatePayload);
                if (salonId) {
                    await updateDocument('salons', salonId, finalData.salon);
                }
            }

            showToast(mode === 'add' ? 'Partner onboarded successfully' : 'Partner updated successfully', 'success');
            navigate('/super/managers');
        } catch (error) {
            console.error("Error saving:", error);
            showToast('Failed to save partner details', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <ManagerFormSkeleton />;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/super/managers')}
                        className="p-2 glass-card hover:bg-tea-50 text-tea-600 transition-colors border-none"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-tea-900 tracking-tight uppercase">
                            {mode === 'add' ? 'Partner Onboarding' : 'Edit Partner'}
                        </h1>
                        <p className="text-tea-500 font-medium tracking-wide">
                            {mode === 'add' ? 'Register a new salon entity and manager' : 'Update manager and salon details'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="glass-card p-8 space-y-8">
                    <div className="flex items-center gap-4 border-b border-tea-100 pb-4">
                        <div className="p-3 bg-tea-100/50 rounded-xl">
                            <User className="w-6 h-6 text-tea-600" />
                        </div>
                        <h2 className="text-xl font-black text-tea-900 uppercase tracking-tight">Personal Credentials</h2>
                    </div>

                    <div className="flex flex-col items-start gap-4 pb-4">
                        <div className="relative group/avatar">
                            <label className="cursor-pointer">
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setSelectedFile(file);
                                        setPreviewUrl(URL.createObjectURL(file));
                                    }
                                }} />
                                <div className="w-32 h-32 rounded-[2.5rem] bg-tea-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden group-hover/avatar:border-tea-200 transition-colors">
                                    <ImageWithFallback
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        fallbackClassName="w-full h-full flex items-center justify-center text-tea-400 bg-tea-50"
                                        FallbackComponent={User}
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                        <Camera className="w-8 h-8 text-white mb-2" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Update</span>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-tea-800 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                className="input-field"
                                value={formData.manager.name}
                                onChange={e => setFormData({ ...formData, manager: { ...formData.manager, name: e.target.value } })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-tea-800 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                className="input-field"
                                type="email"
                                value={formData.manager.email}
                                onChange={e => setFormData({ ...formData, manager: { ...formData.manager, email: e.target.value } })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-tea-800 uppercase tracking-widest ml-1">Phone Number</label>
                            <input
                                className="input-field"
                                value={formData.manager.phone}
                                onChange={e => setFormData({ ...formData, manager: { ...formData.manager, phone: e.target.value } })}
                                placeholder="Personal contact number"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-tea-800 uppercase tracking-widest ml-1">Professional Brand</label>
                            <input
                                className="input-field"
                                value={formData.manager.brand}
                                onChange={e => setFormData({ ...formData, manager: { ...formData.manager, brand: e.target.value } })}
                                placeholder="Personal/Agency Brand"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-tea-800 uppercase tracking-widest ml-1">Login Password</label>
                            <div className="relative group/pass">
                                <input
                                    className="input-field pr-12"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.manager.password}
                                    onChange={e => setFormData({ ...formData, manager: { ...formData.manager, password: e.target.value } })}
                                    required={mode === 'add'}
                                    placeholder={mode === 'edit' ? "Leave blank to keep current" : "Min. 6 characters"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-tea-400 hover:text-tea-700 hover:bg-tea-50 rounded-lg transition-all"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-tea-800 uppercase tracking-widest ml-1">Personal Address</label>
                            <input
                                className="input-field"
                                value={formData.manager.address}
                                onChange={e => setFormData({ ...formData, manager: { ...formData.manager, address: e.target.value } })}
                                placeholder="Manager's professional address"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-tea-800 uppercase tracking-widest ml-1">Professional Bio</label>
                            <textarea
                                className="input-field min-h-[120px] py-4"
                                value={formData.manager.bio}
                                onChange={e => setFormData({ ...formData, manager: { ...formData.manager, bio: e.target.value } })}
                                placeholder="Brief background or experience"
                            />
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 space-y-8">
                    <div className="flex items-center gap-4 border-b border-tea-100 pb-4">
                        <div className="p-3 bg-tea-100/50 rounded-xl">
                            <Building2 className="w-6 h-6 text-tea-600" />
                        </div>
                        <h2 className="text-xl font-black text-tea-900 uppercase tracking-tight">Salon Entity Registration</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-tea-800 uppercase tracking-widest ml-1">Salon Brand Name</label>
                            <input
                                className="input-field"
                                value={formData.salon.name}
                                onChange={e => setFormData({ ...formData, salon: { ...formData.salon, name: e.target.value } })}
                                placeholder="e.g. Elegance Studio"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-tea-800 uppercase tracking-widest ml-1">Physical Location</label>
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

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => navigate('/super/managers')} disabled={isSaving} className="btn-secondary px-8">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSaving} className="btn-primary px-8 flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSaving ? 'Saving...' : (mode === 'add' ? 'Complete Onboarding' : 'Save Changes')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ManagerForm;
