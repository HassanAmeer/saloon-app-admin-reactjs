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
    updateDocument,
    uploadImage
} from '../../lib/services';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ImageWithFallback from '../../components/ImageWithFallback';
import { ManagerFormSkeleton } from '../../components/Skeleton';

const Profile = () => {
    const { user, setUser, type } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const querySalonId = searchParams.get('salonId');
    const isImpersonating = type === 'superadmin' && !!querySalonId;

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // IDs resolved after loading
    const [managerId, setManagerId] = useState(null);
    const [resolvedSalonId, setResolvedSalonId] = useState(null);

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
        const fetchData = async () => {
            try {
                if (isImpersonating && querySalonId) {
                    // Super admin impersonating — load manager via salonId
                    const salon = await getDocument('salons', querySalonId);
                    if (salon?.managerId) {
                        const manager = await getDocument('salon_managers', salon.managerId);
                        if (manager) {
                            setManagerId(salon.managerId);
                            setResolvedSalonId(querySalonId);
                            setFormData({
                                manager: {
                                    name: manager.name || '',
                                    email: manager.email || '',
                                    phone: manager.phone || '',
                                    bio: manager.bio || '',
                                    brand: manager.brand || '',
                                    address: manager.address || '',
                                    password: '',
                                    imageUrl: manager.imageUrl || ''
                                },
                                salon: {
                                    name: salon.name || '',
                                    address: salon.address || '',
                                    phone: salon.phone || ''
                                }
                            });
                            setPreviewUrl(manager.imageUrl || null);
                        }
                    }
                } else if (user?.id) {
                    // Manager direct login
                    const manager = await getDocument('salon_managers', user.id);
                    const sId = user.salonId;
                    setManagerId(user.id);
                    setResolvedSalonId(sId);

                    if (manager) {
                        setFormData(prev => ({
                            ...prev,
                            manager: {
                                name: manager.name || '',
                                email: manager.email || '',
                                phone: manager.phone || '',
                                bio: manager.bio || '',
                                brand: manager.brand || '',
                                address: manager.address || '',
                                password: '',
                                imageUrl: manager.imageUrl || ''
                            }
                        }));
                        setPreviewUrl(manager.imageUrl || null);
                    }

                    if (sId) {
                        const salon = await getDocument('salons', sId);
                        if (salon) {
                            setFormData(prev => ({
                                ...prev,
                                salon: {
                                    name: salon.name || '',
                                    address: salon.address || '',
                                    phone: salon.phone || ''
                                }
                            }));
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
                showToast('Failed to load profile data', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id, querySalonId, isImpersonating, showToast]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            let finalData = { ...formData };

            // Upload image if new file selected
            if (selectedFile) {
                const url = await uploadImage(selectedFile, `managers/${Date.now()}`);
                if (url) {
                    finalData.manager.imageUrl = url;
                }
            }

            // Build update payload — omit blank password
            const managerPayload = { ...finalData.manager };
            if (!managerPayload.password) delete managerPayload.password;

            await updateDocument('salon_managers', managerId, managerPayload);

            if (resolvedSalonId) {
                await updateDocument('salons', resolvedSalonId, finalData.salon);
            }

            // Update local auth context if manager is viewing their own profile
            if (!isImpersonating) {
                const updatedUser = { ...user, ...managerPayload };
                setUser(updatedUser);
                localStorage.setItem('salon_user', JSON.stringify(updatedUser));
            }

            showToast('Profile updated successfully', 'success');
        } catch (error) {
            console.error('Error saving profile:', error);
            showToast('Failed to save profile', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <ManagerFormSkeleton />;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 glass-card hover:bg-tea-50 text-tea-600 transition-colors border-none"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-tea-900 tracking-tight uppercase">
                            {isImpersonating ? 'Manager Profile' : 'My Profile'}
                        </h1>
                        <p className="text-tea-500 font-medium tracking-wide">
                            {isImpersonating ? 'Update manager and salon details' : 'Update your personal and salon details'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Credentials Card */}
                <div className="glass-card p-8 space-y-8">
                    <div className="flex items-center gap-4 border-b border-tea-100 pb-4">
                        <div className="p-3 bg-tea-100/50 rounded-xl">
                            <User className="w-6 h-6 text-tea-600" />
                        </div>
                        <h2 className="text-xl font-black text-tea-900 uppercase tracking-tight">Personal Credentials</h2>
                    </div>

                    {/* Avatar Upload */}
                    <div className="flex flex-col items-start gap-4 pb-4">
                        <div className="relative group/avatar">
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setSelectedFile(file);
                                            setPreviewUrl(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                                <div className="w-32 h-32 rounded-[2.5rem] bg-tea-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden group-hover/avatar:border-tea-200 transition-colors">
                                    <ImageWithFallback
                                        src={previewUrl}
                                        alt="Profile"
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
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.manager.password}
                                    onChange={e => setFormData({ ...formData, manager: { ...formData.manager, password: e.target.value } })}
                                    placeholder="Leave blank to keep current"
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

                {/* Salon Entity Card */}
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
                        <div className="space-y-2">
                            <label className="text-xs font-black text-tea-800 uppercase tracking-widest ml-1">Salon Phone</label>
                            <input
                                className="input-field"
                                value={formData.salon.phone}
                                onChange={e => setFormData({ ...formData, salon: { ...formData.salon, phone: e.target.value } })}
                                placeholder="Salon contact number"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        disabled={isSaving}
                        className="btn-secondary px-8"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="btn-primary px-8 flex items-center justify-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
