import { useState, useEffect } from 'react';
import {
    Settings,
    Plus,
    Trash2,
    Save,
    CheckCircle,
    Copy,
    ChevronDown,
    ChevronUp,
    LayoutGrid,
    MessageSquare,
    Zap,
    Loader2,
    MapPin,
    Droplets,
    Image as ImageIcon,
    Upload
} from 'lucide-react';
import {
    subscribeToCollection,
    updateDocument,
    createDocument,
    uploadImage
} from '../lib/services';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const AppConfig = () => {
    const [configs, setConfigs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('questionnaire');

    // Subscribe to app configuration
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const configRef = doc(db, 'settings', 'app_config');
                const configSnap = await getDoc(configRef);

                if (configSnap.exists()) {
                    setConfigs(configSnap.data());
                } else {
                    // Create default config if doesn't exist
                    const defaultConfig = {
                        hairTypes: ['Straight', 'Wavy', 'Curly', 'Coily'],
                        hairConditions: ['Dry', 'Oily', 'Normal', 'Dandruff', 'Colored', 'Thinning'],
                        scanMetrics: ['Hydration', 'Strength', 'Scalp Health'],
                        questionnaire: [
                            { id: 'age', question: 'Age group?', options: ['Under 18', '18-25', '26-35', '36-50', '50+'], type: 'dropdown' },
                            { id: 'gender', question: 'Gender?', options: ['Female', 'Male', 'Non-binary', 'Prefer not to say'], type: 'dropdown' },
                            { id: 'service', question: 'Service you prefer', options: ['Haircut', 'Coloring', 'Treatment', 'Styling'], type: 'dropdown' },
                            { id: 'health', question: "Hair's current health?", options: ['Very Healthy', 'Healthy', 'Minor Damage', 'Severely Damaged'], type: 'dropdown' }
                        ],
                        homeCategories: [
                            { id: 'ai', label: 'A.I', icon: 'Sparkles' },
                            { id: 'scans', label: 'Hair Scans', icon: 'Scan' },
                            { id: 'products', label: 'Products', icon: 'Package' }
                        ],
                        supportEmail: 'support@saloon-app.com',
                        supportPhone: '+1 (555) 123-4567',
                        termsAndConditions: 'Please read our terms and conditions...',
                        privacyPolicy: 'Your privacy is important to us...',
                        aiModelSettings: {
                            sensitivity: 0.75,
                            autoRecommend: true
                        }
                    };
                    await setDoc(configRef, defaultConfig);
                    setConfigs(defaultConfig);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching config:", error);
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'app_config'), configs);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error("Error saving config:", error);
            alert('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const addListValue = (key) => {
        const newValue = prompt(`Add new value to ${key}:`);
        if (newValue && !configs[key].includes(newValue)) {
            setConfigs({ ...configs, [key]: [...configs[key], newValue] });
        }
    };

    const removeListValue = (key, value) => {
        setConfigs({ ...configs, [key]: configs[key].filter(v => v !== value) });
    };

    const addQuestion = () => {
        const newQuestion = {
            id: `q_${Date.now()}`,
            question: 'New Question?',
            options: ['Option 1', 'Option 2'],
            type: 'dropdown'
        };
        setConfigs({ ...configs, questionnaire: [...configs.questionnaire, newQuestion] });
    };

    const updateQuestion = (id, field, value) => {
        const updated = configs.questionnaire.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        );
        setConfigs({ ...configs, questionnaire: updated });
    };

    const removeQuestion = (id) => {
        setConfigs({ ...configs, questionnaire: configs.questionnaire.filter(q => q.id !== id) });
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-gray-200 rounded-lg" />
                        <div className="h-4 w-96 bg-gray-100 rounded-lg" />
                    </div>
                    <div className="h-10 w-32 bg-tea-100 rounded-lg" />
                </div>

                {/* Tabs Skeleton */}
                <div className="flex border-b border-gray-200 overflow-x-auto gap-2 pb-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="px-6 py-3">
                            <div className="h-5 w-24 bg-gray-200 rounded-full" />
                        </div>
                    ))}
                </div>

                {/* Content Skeleton (Simulating Questionnaire/Cards) */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="h-6 w-48 bg-gray-200 rounded-lg" />
                        <div className="h-8 w-32 bg-gray-200 rounded-lg" />
                    </div>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card border border-gray-100 bg-white p-6 space-y-4">
                            <div className="flex justify-between">
                                <div className="h-5 w-1/3 bg-gray-100 rounded" />
                                <div className="h-5 w-5 bg-gray-100 rounded" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="h-4 w-20 bg-gray-100 rounded" />
                                    <div className="h-10 w-full bg-gray-50 rounded-lg border border-gray-100" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-20 bg-gray-100 rounded" />
                                    <div className="h-10 w-full bg-gray-50 rounded-lg border border-gray-100" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-tea-800">App Configuration</h1>
                    <p className="text-gray-600 mt-1">Control labels and options in the Flutter app</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary flex items-center gap-2"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('questionnaire')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'questionnaire' ? 'border-tea-700 text-tea-800' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Questionnaire
                </button>
                <button
                    onClick={() => setActiveTab('hair')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'hair' ? 'border-tea-700 text-tea-800' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Zap className="w-4 h-4 inline mr-2" />
                    Hair Config
                </button>
                <button
                    onClick={() => setActiveTab('colors')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'colors' ? 'border-tea-700 text-tea-800' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Droplets className="w-4 h-4 inline mr-2" />
                    Hair Colors
                </button>
                <button
                    onClick={() => setActiveTab('home')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'home' ? 'border-tea-700 text-tea-800' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <LayoutGrid className="w-4 h-4 inline mr-2" />
                    App Layout
                </button>
                <button
                    onClick={() => setActiveTab('salon')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'salon' ? 'border-tea-700 text-tea-800' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Salon Profile
                </button>
                <button
                    onClick={() => setActiveTab('support')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'support' ? 'border-tea-700 text-tea-800' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Settings className="w-4 h-4 inline mr-2" />
                    Support
                </button>
                <button
                    onClick={() => setActiveTab('business')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'business' ? 'border-tea-700 text-tea-800' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Copy className="w-4 h-4 inline mr-2" />
                    Legal
                </button>
            </div>

            {/* Content */}
            <div className="mt-6">
                {activeTab === 'questionnaire' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-tea-800">Flutter App Questionnaire</h3>
                            <button onClick={addQuestion} className="btn-secondary text-sm flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Add Question
                            </button>
                        </div>
                        <div className="grid gap-4">
                            {configs.questionnaire.map((q, idx) => (
                                <div key={q.id} className="card relative group border-l-4 border-tea-500">
                                    <button
                                        onClick={() => removeQuestion(q.id)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        <div className="md:col-span-1 border-r border-gray-100 hidden md:flex items-center justify-center font-bold text-tea-800">
                                            {idx + 1}
                                        </div>
                                        <div className="md:col-span-5">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Question Text</label>
                                            <input
                                                type="text"
                                                value={q.question}
                                                onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                                                className="input-field"
                                                placeholder="Enter question..."
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Response Type</label>
                                            <select
                                                value={q.type}
                                                onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                                                className="input-field"
                                            >
                                                <option value="dropdown">Dropdown</option>
                                                <option value="multiselect">Multi-select</option>
                                                <option value="text">Text Input</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-4">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Options (comma separated)</label>
                                            <input
                                                type="text"
                                                value={q.options?.join(', ')}
                                                onChange={(e) => updateQuestion(q.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                                                className="input-field"
                                                placeholder="Opt 1, Opt 2..."
                                                disabled={q.type === 'text'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'hair' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Hair Types */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-tea-800">Hair Types</h3>
                                    <button onClick={() => addListValue('hairTypes')} className="btn-secondary text-xs">Add Type</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {configs.hairTypes.map(type => (
                                        <div key={type} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm">
                                            <span className="text-tea-800 font-medium">{type}</span>
                                            <button onClick={() => removeListValue('hairTypes', type)} className="text-gray-400 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Hair Conditions */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-tea-800">Hair Conditions</h3>
                                    <button onClick={() => addListValue('hairConditions')} className="btn-secondary text-xs">Add Condition</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {configs.hairConditions.map(condition => (
                                        <div key={condition} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm">
                                            <span className="text-tea-800 font-medium">{condition}</span>
                                            <button onClick={() => removeListValue('hairConditions', condition)} className="text-gray-400 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Scan Metrics */}
                        <div className="space-y-4 border-t pt-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-tea-800">Hair Scan Metrics</h3>
                                <button onClick={() => addListValue('scanMetrics')} className="btn-secondary text-xs">Add Metric</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {configs.scanMetrics?.map(metric => (
                                    <div key={metric} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm">
                                        <span className="text-tea-800 font-medium">{metric}</span>
                                        <button onClick={() => removeListValue('scanMetrics', metric)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'colors' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-tea-800">Visual Hair Colors</h3>
                            <button
                                onClick={() => {
                                    const name = prompt('Enter color name:');
                                    if (name) setConfigs({ ...configs, hairColors: [...(configs.hairColors || []), { id: Date.now().toString(), name, imageUrl: '' }] });
                                }}
                                className="btn-secondary text-sm flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Color
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {configs.hairColors?.map((color, idx) => (
                                <div key={color.id} className="card relative group overflow-hidden">
                                    <button
                                        onClick={() => setConfigs({ ...configs, hairColors: configs.hairColors.filter(c => c.id !== color.id) })}
                                        className="absolute top-2 right-2 z-10 bg-white/80 p-1.5 rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="aspect-square bg-gray-100 mb-3 rounded-lg overflow-hidden relative">
                                        {color.imageUrl ? (
                                            <img src={color.imageUrl} alt={color.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Droplets className="w-10 h-10 text-gray-300" />
                                            </div>
                                        )}
                                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const url = await uploadImage(file, `config/colors/${file.name}`);
                                                        const updated = configs.hairColors.map(c => c.id === color.id ? { ...c, imageUrl: url } : c);
                                                        setConfigs({ ...configs, hairColors: updated });
                                                    }
                                                }}
                                            />
                                            <Upload className="w-6 h-6 text-white" />
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        value={color.name}
                                        onChange={(e) => {
                                            const updated = configs.hairColors.map(c => c.id === color.id ? { ...c, name: e.target.value } : c);
                                            setConfigs({ ...configs, hairColors: updated });
                                        }}
                                        className="w-full text-center font-semibold text-tea-800 bg-transparent border-none focus:ring-0 p-0"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'home' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        {/* Banner Management */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-tea-800">Home Screen Banner</h3>
                            <div className="card grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-4">
                                    <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative group">
                                        {configs.homeBanner?.imageUrl ? (
                                            <img src={configs.homeBanner.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="w-12 h-12 text-gray-300" />
                                            </div>
                                        )}
                                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const url = await uploadImage(file, `config/banner/${file.name}`);
                                                        setConfigs({ ...configs, homeBanner: { ...configs.homeBanner, imageUrl: url } });
                                                    }
                                                }}
                                            />
                                            <Upload className="w-8 h-8 text-white" />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 text-center">Recommended size: 1200x600px</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title</label>
                                        <input
                                            type="text"
                                            value={configs.homeBanner?.title}
                                            onChange={(e) => setConfigs({ ...configs, homeBanner: { ...configs.homeBanner, title: e.target.value } })}
                                            className="input-field"
                                            placeholder="e.g. Appointment"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Subtitle</label>
                                        <input
                                            type="text"
                                            value={configs.homeBanner?.subtitle}
                                            onChange={(e) => setConfigs({ ...configs, homeBanner: { ...configs.homeBanner, subtitle: e.target.value } })}
                                            className="input-field"
                                            placeholder="e.g. Lahore, Pakistan"
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={configs.homeBanner?.showStats}
                                            onChange={(e) => setConfigs({ ...configs, homeBanner: { ...configs.homeBanner, showStats: e.target.checked } })}
                                            className="w-4 h-4 text-tea-700 rounded focus:ring-brown-500"
                                        />
                                        <span className="text-sm text-gray-700">Display Live Activity Stats</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Categories Management */}
                        <div className="space-y-4 pt-8 border-t">
                            <h3 className="text-lg font-semibold text-tea-800">Quick Action Categories</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {configs.homeCategories.map((cat, idx) => (
                                    <div key={cat.id} className="card bg-gradient-to-br from-white to-tea-50">
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Category Label</label>
                                                <input
                                                    type="text"
                                                    value={cat.label}
                                                    onChange={(e) => {
                                                        const updated = configs.homeCategories.map((c, i) => i === idx ? { ...c, label: e.target.value } : c);
                                                        setConfigs({ ...configs, homeCategories: updated });
                                                    }}
                                                    className="input-field"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Internal Key</label>
                                                <p className="font-mono text-sm text-gray-400">{cat.id}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'salon' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <h3 className="text-lg font-semibold text-tea-800">Salon Profile & Identity</h3>
                        <div className="card space-y-6">
                            <div className="flex flex-col items-center pb-6 border-b border-gray-100">
                                <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden relative group border-2 border-dashed border-gray-200 mb-4">
                                    {configs.salonInfo?.logoUrl ? (
                                        <img src={configs.salonInfo.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-gray-300" />
                                        </div>
                                    )}
                                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const url = await uploadImage(file, `salon/logo/${file.name}`);
                                                    setConfigs({ ...configs, salonInfo: { ...configs.salonInfo, logoUrl: url } });
                                                }
                                            }}
                                        />
                                        <Upload className="w-6 h-6 text-white" />
                                    </label>
                                </div>
                                <div className="text-center">
                                    <h4 className="font-semibold text-tea-800">Company Logo</h4>
                                    <p className="text-xs text-gray-500">Applies to app header and reports</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Salon Name</label>
                                    <input
                                        type="text"
                                        value={configs.salonInfo?.name}
                                        onChange={(e) => setConfigs({ ...configs, salonInfo: { ...configs.salonInfo, name: e.target.value } })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Location</label>
                                    <input
                                        type="text"
                                        value={configs.salonInfo?.location}
                                        onChange={(e) => setConfigs({ ...configs, salonInfo: { ...configs.salonInfo, location: e.target.value } })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Public Phone Number</label>
                                    <input
                                        type="text"
                                        value={configs.salonInfo?.phone}
                                        onChange={(e) => setConfigs({ ...configs, salonInfo: { ...configs.salonInfo, phone: e.target.value } })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner/Manager Name</label>
                                    <input
                                        type="text"
                                        value={configs.salonInfo?.owner}
                                        onChange={(e) => setConfigs({ ...configs, salonInfo: { ...configs.salonInfo, owner: e.target.value } })}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'support' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <h3 className="text-lg font-semibold text-tea-800">Support Contact Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="card">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                                <input
                                    type="email"
                                    value={configs.supportEmail}
                                    onChange={(e) => setConfigs({ ...configs, supportEmail: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="card">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
                                <input
                                    type="text"
                                    value={configs.supportPhone}
                                    onChange={(e) => setConfigs({ ...configs, supportPhone: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'business' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <h3 className="text-lg font-semibold text-tea-800">Legal & Business Content</h3>
                        <div className="space-y-6">
                            <div className="card">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                                <textarea
                                    value={configs.termsAndConditions}
                                    onChange={(e) => setConfigs({ ...configs, termsAndConditions: e.target.value })}
                                    className="input-field min-h-[200px]"
                                    placeholder="Enter terms and conditions content..."
                                />
                            </div>
                            <div className="card">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Policy</label>
                                <textarea
                                    value={configs.privacyPolicy}
                                    onChange={(e) => setConfigs({ ...configs, privacyPolicy: e.target.value })}
                                    className="input-field min-h-[200px]"
                                    placeholder="Enter privacy policy content..."
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppConfig;
