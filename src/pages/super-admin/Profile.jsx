import { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Lock,
    Camera,
    Save,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateDocument, uploadImage } from '../../lib/services';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        imageUrl: user?.imageUrl || ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.imageUrl || null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                imageUrl: user.imageUrl || ''
            });
            setPreviewUrl(user.imageUrl || null);
        }
    }, [user]);

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
        setSuccess(false);

        try {
            let imageUrl = formData.imageUrl;
            if (selectedFile) {
                const uploadedUrl = await uploadImage(selectedFile, `avatars/super_${user.id}_${Date.now()}`);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                }
            }

            const updateData = {
                name: formData.name,
                email: formData.email,
                imageUrl: imageUrl
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            await updateDocument('super_admins', user.id, updateData);

            // Update local state
            const updatedUser = { ...user, ...updateData };
            delete updatedUser.password;
            setUser(updatedUser);
            localStorage.setItem('saloon_user', JSON.stringify(updatedUser));

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-4xl font-black text-tea-900 tracking-tight">My <span className="text-tea-700">Profile</span></h1>
                <p className="text-tea-500 font-medium tracking-wide">Manage your platform administrator account credentials</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Image Section */}
                <div className="lg:col-span-1">
                    <div className="card text-center space-y-6">
                        <div className="relative inline-block">
                            <div className="w-40 h-40 rounded-3xl bg-tea-100 border-4 border-white shadow-xl overflow-hidden group">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-tea-300">
                                        <User className="w-20 h-20" />
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-8 h-8 text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-tea-900">{user?.name}</h3>
                            <p className="text-sm text-tea-500 uppercase tracking-widest font-bold">Super Administrator</p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-tea-800 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" /> Full Name
                                    </label>
                                    <input
                                        className="input-field"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-tea-800 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5" /> Email Address
                                    </label>
                                    <input
                                        className="input-field"
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2 col-span-full">
                                    <label className="text-xs font-black text-tea-800 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Lock className="w-3.5 h-3.5" /> Password
                                    </label>
                                    <input
                                        className="input-field"
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Enter new password to update (leave blank to keep current)"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-tea-100">
                                {success ? (
                                    <div className="flex items-center gap-2 text-green-600 font-bold animate-in fade-in zoom-in duration-300">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Profile Updated!</span>
                                    </div>
                                ) : <div />}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary flex items-center gap-2 px-8 min-w-[200px] justify-center"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    <span>Save Profile</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
