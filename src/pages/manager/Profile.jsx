import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import {
    User,
    Mail,
    Lock,
    Camera,
    Save,
    Loader2,
    CheckCircle2,
    Building2,
    Phone,
    Eye,
    EyeOff,
    MapPin,
    ShieldCheck,
    Smartphone,
    Info,
    Briefcase
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateDocument, uploadImage, subscribeToCollection, getDocument } from '../../lib/services';
import { cn } from '../../lib/utils';

const Profile = () => {
    const { user, setUser, type } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [salonData, setSalonData] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: user?.password || '',
        imageUrl: user?.imageUrl || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        brand: user?.brand || '',
        address: user?.address || ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.imageUrl || null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.id) return;
            try {
                const collectionName = user.type === 'superadmin' ? 'super_admin_setting' : 'salon_managers';
                const fullUserData = await getDocument(collectionName, user.id);
                if (fullUserData) {
                    setFormData({
                        name: fullUserData.name || '',
                        email: fullUserData.email || '',
                        password: fullUserData.password || '',
                        imageUrl: fullUserData.imageUrl || '',
                        phone: fullUserData.phone || '',
                        bio: fullUserData.bio || '',
                        brand: fullUserData.brand || '',
                        address: fullUserData.address || ''
                    });
                    setPreviewUrl(fullUserData.imageUrl || null);

                    // Also update context if it's different
                    const updatedUser = {
                        ...user,
                        ...fullUserData,
                    };
                    setUser(updatedUser);
                    localStorage.setItem('salon_user', JSON.stringify(updatedUser));
                }
            } catch (error) {
                console.error("Error fetching full user data:", error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                password: user.password || prev.password,
                imageUrl: user.imageUrl || prev.imageUrl,
                phone: user.phone || prev.phone,
                bio: user.bio || prev.bio,
                brand: user.brand || prev.brand,
                address: user.address || prev.address
            }));
            if (user.imageUrl) setPreviewUrl(user.imageUrl);

            if (type === 'salonmanager' && user.salonId) {
                const unsub = subscribeToCollection('salons', (salons) => {
                    const mySalon = salons.find(s => s.id === user.salonId);
                    if (mySalon) setSalonData(mySalon);
                });
                return () => unsub();
            }
        }
    }, [user, type]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = formData.imageUrl;
            if (selectedFile) {
                const folder = type === 'superadmin' ? 'super_admin' : 'managers';
                const uploadedUrl = await uploadImage(selectedFile, `avatars/${folder}_${user.id}_${Date.now()}`);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                }
            }

            const updateData = {
                name: formData.name,
                email: formData.email,
                imageUrl: imageUrl,
                phone: formData.phone,
                bio: formData.bio,
                brand: formData.brand,
                address: formData.address
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            const collectionName = user.type === 'superadmin' ? 'super_admin_setting' : 'salon_managers';
            await updateDocument(collectionName, user.id, updateData);

            const updatedUser = {
                ...user,
                ...updateData,
            };
            setUser(updatedUser);
            localStorage.setItem('salon_user', JSON.stringify(updatedUser));

            showToast('Profile updated successfully', 'success');
        } catch (error) {
            console.error("Error updating profile:", error);
            showToast('Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Premium Header */}
            <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl p-10 lg:p-14 rounded-[3rem] border border-white/60 shadow-[0_32px_64px_-16px_rgba(44,58,35,0.08)] flex flex-col md:flex-row items-center gap-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-tea-100/30 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-brown-100/20 rounded-full blur-3xl -ml-24 -mb-24" />

                <div className="relative group shrink-0">
                    <div className="w-44 h-44 rounded-[2.5rem] bg-tea-50 border-[6px] border-white shadow-2xl overflow-hidden ring-1 ring-tea-700/5 rotate-0 group-hover:rotate-3 transition-all duration-500">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Portrait" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-tea-200">
                                <User className="w-20 h-20" />
                            </div>
                        )}
                        <label className="absolute inset-0 bg-tea-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md mb-2">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Change Photo</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>
                </div>

                <div className="relative text-center md:text-left space-y-5">
                    <div className="space-y-2">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <span className="w-6 h-[1px] bg-tea-300" />
                            <span className="text-[10px] font-black text-tea-600 uppercase tracking-[0.3em]">Administrator Identity</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-tea-950 tracking-tight flex flex-col sm:flex-row items-center gap-3">
                            {formData.name || 'Anonymous User'}
                        </h1>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <div className="px-5 py-2 rounded-2xl bg-tea-900 text-tea-50 text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 shadow-lg shadow-tea-900/20">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {type === 'superadmin' ? 'Platform Authority' : 'Salon Executive'}
                        </div>
                        {type === 'salonmanager' && salonData && (
                            <div className="px-5 py-2 rounded-2xl bg-white border border-tea-100 text-tea-700 text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 shadow-sm">
                                <Building2 className="w-3.5 h-3.5" />
                                {salonData.name}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="relative space-y-10">
                <div className="glass-card p-10 lg:p-14 space-y-10 border-white/50 bg-white/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Name Field */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-tea-800 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                className="input-field bg-white/60 focus:bg-white transition-all h-14"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Email Field */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-tea-800 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                className="input-field bg-white/60 focus:bg-white transition-all h-14"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        {/* Phone Field */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-tea-800 uppercase tracking-widest ml-1">Direct Phone</label>
                            <input
                                className="input-field bg-white/60 h-14"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1 (000) 000-0000"
                            />
                        </div>

                        {/* Brand Field (Conditional) */}
                        {type === 'salonmanager' && (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-tea-800 uppercase tracking-widest ml-1">Salon Brand</label>
                                <input
                                    className="input-field bg-white/60 h-14"
                                    value={formData.brand}
                                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                    placeholder="Brand Name"
                                />
                            </div>
                        )}

                        {/* Address Field */}
                        <div className={cn("space-y-3", type === 'superadmin' ? "col-span-1" : "col-span-1")}>
                            <label className="text-[10px] font-black text-tea-800 uppercase tracking-widest ml-1">Professional Address</label>
                            <input
                                className="input-field bg-white/60 h-14"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Operational headquarters address"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-tea-800 uppercase tracking-widest ml-1">Master Password</label>
                            <div className="relative group">
                                <input
                                    className="input-field pr-12 bg-white/60 h-14"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-tea-400 hover:text-tea-800 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Bio Field (Conditional) */}
                        {type === 'salonmanager' && (
                            <div className="space-y-3 col-span-full pt-4">
                                <label className="text-[10px] font-black text-tea-800 uppercase tracking-widest ml-1">Executive Narrative</label>
                                <textarea
                                    className="input-field min-h-[140px] p-6 resize-none leading-relaxed bg-white/60 focus:bg-white"
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Write your professional bio..."
                                />
                            </div>
                        )}
                    </div>

                    {/* Actions Module */}
                    <div className="flex items-center justify-end pt-10 border-t border-tea-100/30">


                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary min-w-[200px] h-14 rounded-2xl shadow-[0_20px_40px_-12px_rgba(42,59,28,0.2)] hover:shadow-[0_25px_50px_-12px_rgba(42,59,28,0.3)] active:scale-95 transition-all flex items-center justify-center gap-4 bg-tea-900 group"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                            <span className="font-black uppercase tracking-[0.2em] text-[10px]">Update Profile</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Profile;
