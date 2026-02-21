import { useState, useEffect } from 'react';
import {
    Building2,
    Phone,
    Mail,
    MapPin,
    Save,
    Loader2,
    CheckCircle2,
    HelpCircle,
    Globe,
    Camera,
    Upload,
    ShieldAlert,
    FileText,
    MessageSquare,
    Zap,
    Briefcase,
    Settings as SettingsIcon,
    ShieldCheck,
    Smartphone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { uploadImage } from '../../lib/services';
import { cn } from '../../lib/utils';
import ImageWithFallback from '../../components/ImageWithFallback';
import { ProfileSkeleton } from '../../components/Skeleton';

import { useSearchParams } from 'react-router-dom';

const Settings = () => {
    const { user, type } = useAuth();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const querySalonId = searchParams.get('salonId');
    const isImpersonating = type === 'superadmin' && querySalonId;
    const activeSalonId = querySalonId || user?.salonId;

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        bio: '',
        supportEmail: '',
        supportPhone: '',
        website: '',
        logoUrl: '',
        termsAndConditions: '',
        privacyPolicy: '',
        tagline: ''
    });

    useEffect(() => {
        const fetchSalonSettings = async () => {
            if (!activeSalonId) {
                setLoading(false);
                return;
            }
            try {
                const salonRef = doc(db, 'salons', activeSalonId);
                const salonSnap = await getDoc(salonRef);
                if (salonSnap.exists()) {
                    const data = salonSnap.data();
                    setFormData({
                        name: data.name || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        bio: data.bio || '',
                        supportEmail: data.supportEmail || '',
                        supportPhone: data.supportPhone || '',
                        website: data.website || '',
                        logoUrl: data.logoUrl || '',
                        termsAndConditions: data.termsAndConditions || '',
                        privacyPolicy: data.privacyPolicy || '',
                        tagline: data.tagline || ''
                    });
                }
            } catch (error) {
                console.error("Error fetching salon settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSalonSettings();
    }, [activeSalonId]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!activeSalonId) return;

        setIsSaving(true);
        setSuccess(false);
        try {
            const salonRef = doc(db, 'salons', activeSalonId);
            await updateDoc(salonRef, {
                ...formData,
                updatedAt: new Date()
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving salon settings:", error);
            alert("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (file && activeSalonId) {
            try {
                const url = await uploadImage(file, `salons/${activeSalonId}/logo_${Date.now()}`);
                if (url) {
                    setFormData(prev => ({ ...prev, logoUrl: url }));
                }
            } catch (error) {
                console.error("Logo upload failed:", error);
                alert("Logo upload failed");
            }
        }
    };

    if (loading) return <ProfileSkeleton />;

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
            {/* Header Banner */}
            <div className="relative h-60 rounded-[2.5rem] overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-tea-800 via-tea-900 to-black">
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
                </div>

                <div className="absolute inset-0 p-8 lg:p-12 flex flex-col md:flex-row items-center md:items-center gap-8">
                    <div className="relative shrink-0 group/logo">
                        <div className="w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover/logo:scale-105">
                            <ImageWithFallback
                                src={formData.logoUrl}
                                alt="Logo"
                                className="w-full h-full object-contain p-4"
                                fallbackClassName="w-full h-full flex items-center justify-center p-8 opacity-40 grayscale invert"
                            />
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer">
                                <Camera className="w-6 h-6 text-white mb-1" />
                                <span className="text-[7px] font-black text-white uppercase tracking-widest">Update Logo</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            </label>
                        </div>
                    </div>

                    <div className="text-center md:text-left text-white space-y-2">
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight uppercase">{formData.name || 'Salon Settings'}</h1>
                        <p className="text-tea-100/60 font-medium text-sm lg:text-lg italic flex items-center justify-center md:justify-start gap-2">
                            <Zap className="w-4 h-4 text-tea-400" /> {formData.tagline || 'Manage your business configuration'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8 pb-20">
                <div className="glass-card p-8 lg:p-12 space-y-12">
                    {/* Business Profile Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-tea-50 flex items-center justify-center text-tea-700 ring-1 ring-tea-700/5">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-tea-900 uppercase tracking-tight">Business Profile</h2>
                                <p className="text-[10px] font-black text-tea-400 uppercase tracking-widest">General information and location</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-tea-700 uppercase tracking-[0.2em] ml-2">App Name / Salon Name</label>
                                <input
                                    className="input-field"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-tea-700 uppercase tracking-[0.2em] ml-2">Brand Tagline</label>
                                <input
                                    className="input-field"
                                    value={formData.tagline}
                                    onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                                    placeholder="e.g. Elegance in Every Cut"
                                />
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-black text-tea-700 uppercase tracking-[0.2em] ml-2">Digital HQ (Website)</label>
                                <div className="relative group">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tea-300 group-focus-within:text-tea-700 transition-colors" />
                                    <input
                                        className="input-field pl-12"
                                        value={formData.website}
                                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="www.yourbrand.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-black text-tea-700 uppercase tracking-[0.2em] ml-2">Physical Location</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tea-300 group-focus-within:text-tea-700 transition-colors" />
                                    <input
                                        className="input-field pl-12"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-black text-tea-700 uppercase tracking-[0.2em] ml-2">Brand Narrative (Bio)</label>
                                <textarea
                                    className="input-field min-h-[140px] p-6 resize-none leading-relaxed"
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Describe your salon's mission..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Support Channels Section */}
                    <div className="space-y-8 pt-10 border-t border-tea-700/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-tea-50 flex items-center justify-center text-tea-700 ring-1 ring-tea-700/5">
                                <HelpCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-tea-900 uppercase tracking-tight">Support & Concierge</h2>
                                <p className="text-[10px] font-black text-tea-400 uppercase tracking-widest">Client assistance and communication setup</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-tea-700 uppercase tracking-[0.2em] ml-2">Support Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tea-300 group-focus-within:text-tea-700 transition-colors" />
                                    <input
                                        className="input-field pl-12"
                                        type="email"
                                        value={formData.supportEmail}
                                        onChange={e => setFormData({ ...formData, supportEmail: e.target.value })}
                                        placeholder="support@yourbrand.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-tea-700 uppercase tracking-[0.2em] ml-2">Concierge Phone (Support)</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tea-300 group-focus-within:text-tea-700 transition-colors" />
                                    <input
                                        className="input-field pl-12"
                                        value={formData.supportPhone}
                                        onChange={e => setFormData({ ...formData, supportPhone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Legal & Policies Section */}
                    <div className="space-y-8 pt-10 border-t border-tea-700/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-tea-50 flex items-center justify-center text-tea-700 ring-1 ring-tea-700/5">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-tea-900 uppercase tracking-tight">Legal & Policies</h2>
                                <p className="text-[10px] font-black text-tea-400 uppercase tracking-widest">Platform terms and consumer protection setup</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-tea-700 uppercase tracking-[0.2em] ml-2">Terms & Conditions</label>
                                <textarea
                                    className="input-field min-h-[180px] p-6 resize-none leading-relaxed text-sm font-medium"
                                    value={formData.termsAndConditions}
                                    onChange={e => setFormData({ ...formData, termsAndConditions: e.target.value })}
                                    placeholder="Enter terms and conditions..."
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-tea-700 uppercase tracking-[0.2em] ml-2">Privacy Policy</label>
                                <textarea
                                    className="input-field min-h-[180px] p-6 resize-none leading-relaxed text-sm font-medium"
                                    value={formData.privacyPolicy}
                                    onChange={e => setFormData({ ...formData, privacyPolicy: e.target.value })}
                                    placeholder="Enter privacy policy..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-10 border-t border-tea-700/10">
                        <div className="flex-1">
                            {success && (
                                <div className="flex items-center gap-3 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] animate-in fade-in slide-in-from-left-4">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Sync Successful</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn-primary group flex items-center gap-4 px-12 py-4 h-14 min-w-[280px] justify-center shadow-2xl shadow-tea-950/20 active:scale-[0.98] disabled:opacity-50 transition-all font-black uppercase tracking-[0.2em] text-[11px]"
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                            )}
                            Save Environment
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Settings;
