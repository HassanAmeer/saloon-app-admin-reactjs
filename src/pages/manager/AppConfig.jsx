import { useState, useEffect } from 'react';
import {
    Settings,
    Plus,
    Trash2,
    Save,
    MessageSquare,
    Zap,
    Loader2,
    MapPin,
    Droplets,
    Upload,
    Copy,
    LayoutGrid
} from 'lucide-react';
import { uploadImage } from '../../lib/services';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import ImageWithFallback from '../../components/ImageWithFallback';
import { Skeleton } from '../../components/Skeleton';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const TABS = [
    { id: 'questionnaire', label: 'Questionnaire', icon: MessageSquare },
    { id: 'hair', label: 'Hair Config', icon: Zap },
    { id: 'colors', label: 'Hair Colors', icon: Droplets },
    { id: 'home', label: 'App Layout', icon: LayoutGrid },
    { id: 'salon', label: 'Salon Profile', icon: MapPin },
    { id: 'support', label: 'Support', icon: Settings },
    { id: 'business', label: 'Legal', icon: Copy },
];

const AppConfig = () => {
    const { user, type } = useAuth();
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const [configs, setConfigs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('questionnaire');
    const querySalonId = searchParams.get('salonId');
    const isImpersonating = type === 'superadmin' && querySalonId;
    const activeSalonId = querySalonId || user?.salonId;

    useEffect(() => {
        const fetchConfig = async () => {
            if (!activeSalonId && !isImpersonating && type !== 'superadmin') { setLoading(false); return; }
            try {
                const configRef = (type === 'superadmin' && !isImpersonating)
                    ? doc(db, 'settings', 'platform_config')
                    : doc(db, `salons/${activeSalonId}/settings`, 'app_config');
                const configSnap = await getDoc(configRef);

                if (configSnap.exists()) {
                    setConfigs(configSnap.data());
                } else {
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
                            { id: 'ai', label: 'A.I', icon: 'Bot' },
                            { id: 'scans', label: 'Hair Scans', icon: 'Scan' },
                            { id: 'products', label: 'Products', icon: 'Package' }
                        ],
                        supportEmail: 'support@salon-app.com',
                        supportPhone: '+1 (555) 123-4567',
                        termsAndConditions: 'Please read our terms and conditions...',
                        privacyPolicy: 'Your privacy is important to us...',
                        aiModelSettings: { sensitivity: 0.75, autoRecommend: true }
                    };
                    await setDoc(configRef, defaultConfig);
                    setConfigs(defaultConfig);
                }
            } catch (error) {
                console.error('Error fetching config:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, [activeSalonId, type, isImpersonating]);

    const handleSave = async () => {
        if (!activeSalonId && !isImpersonating && type !== 'superadmin') return;
        setIsSaving(true);
        try {
            const configRef = (type === 'superadmin' && !isImpersonating)
                ? doc(db, 'settings', 'platform_config')
                : doc(db, `salons/${activeSalonId}/settings`, 'app_config');
            await setDoc(configRef, configs);
            showToast('Configuration saved successfully', 'success');
        } catch (error) {
            console.error('Error saving config:', error);
            showToast('Failed to save configuration', 'error');
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
        const newQ = { id: `q_${Date.now()}`, question: 'New Question?', options: ['Option 1', 'Option 2'], type: 'dropdown' };
        setConfigs({ ...configs, questionnaire: [...configs.questionnaire, newQ] });
    };

    const updateQuestion = (id, field, value) => {
        setConfigs({ ...configs, questionnaire: configs.questionnaire.map(q => q.id === id ? { ...q, [field]: value } : q) });
    };

    const removeQuestion = (id) => {
        setConfigs({ ...configs, questionnaire: configs.questionnaire.filter(q => q.id !== id) });
    };

    if (loading) {
        return (
            <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-2"><Skeleton className="h-12 w-72" /><Skeleton className="h-4 w-48" /></div>
                    <Skeleton className="h-12 w-40 rounded-2xl" />
                </div>
                <div className="flex gap-2 p-1.5 glass-card rounded-2xl overflow-x-auto">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => <Skeleton key={i} className="h-10 w-28 rounded-xl shrink-0" />)}
                </div>
                <div className="glass-card p-8 space-y-6">
                    <Skeleton className="h-7 w-56" />
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-3 p-6 bg-tea-50/50 rounded-2xl">
                            <div className="flex justify-between"><Skeleton className="h-5 w-64" /><Skeleton className="h-5 w-20" /></div>
                            <div className="grid grid-cols-2 gap-3">{[1, 2, 3, 4].map(j => <Skeleton key={j} className="h-10 rounded-xl" />)}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl lg:text-5xl font-black text-tea-900 tracking-tight leading-none">
                        App <span className="text-tea-700">Configuration</span>
                    </h1>
                    <p className="text-tea-400 text-[10px] font-black uppercase tracking-widest">
                        Control labels, options and content in the Flutter app
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary flex items-center gap-3 px-8 h-12 rounded-2xl"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span className="text-[11px] font-black uppercase tracking-widest">Save Changes</span>
                </button>
            </div>

            {/* Tab Pills */}
            <div className="flex p-1.5 glass-card bg-tea-100/30 border-tea-700/5 rounded-2xl overflow-x-auto gap-1">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all',
                                activeTab === tab.id
                                    ? 'bg-tea-700 text-white shadow-md shadow-tea-700/20'
                                    : 'text-tea-500 hover:text-tea-800 hover:bg-tea-50'
                            )}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ─── Tab Content ─── */}

            {/* Questionnaire */}
            {activeTab === 'questionnaire' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <SectionCard
                        title="Flutter App Questionnaire"
                        action={<PillButton icon={Plus} onClick={addQuestion}>Add Question</PillButton>}
                    >
                        <div className="space-y-4">
                            {configs.questionnaire.map((q, idx) => (
                                <div key={q.id} className="relative group p-6 bg-tea-50/60 border border-tea-100 rounded-2xl hover:border-tea-200 transition-colors">
                                    <div className="absolute top-5 left-6 w-6 h-6 rounded-lg bg-tea-700 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                                        {idx + 1}
                                    </div>
                                    <button
                                        onClick={() => removeQuestion(q.id)}
                                        className="absolute top-5 right-5 w-7 h-7 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pl-10">
                                        <div className="md:col-span-5 space-y-1">
                                            <label className="text-[10px] font-black text-tea-600 uppercase tracking-widest">Question Text</label>
                                            <input
                                                type="text"
                                                value={q.question}
                                                onChange={e => updateQuestion(q.id, 'question', e.target.value)}
                                                className="input-field h-10"
                                                placeholder="Enter question..."
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-[10px] font-black text-tea-600 uppercase tracking-widest">Response Type</label>
                                            <select
                                                value={q.type}
                                                onChange={e => updateQuestion(q.id, 'type', e.target.value)}
                                                className="input-field h-10"
                                            >
                                                <option value="dropdown">Dropdown</option>
                                                <option value="multiselect">Multi-select</option>
                                                <option value="text">Text Input</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-5 space-y-1">
                                            <label className="text-[10px] font-black text-tea-600 uppercase tracking-widest">Options (comma separated)</label>
                                            <input
                                                type="text"
                                                value={q.options?.join(', ')}
                                                onChange={e => updateQuestion(q.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                                                className="input-field h-10"
                                                placeholder="Opt 1, Opt 2..."
                                                disabled={q.type === 'text'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            )}

            {/* Hair Config */}
            {activeTab === 'hair' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SectionCard title="Hair Types" action={<PillButton icon={Plus} onClick={() => addListValue('hairTypes')}>Add Type</PillButton>}>
                            <TagList items={configs.hairTypes} onRemove={v => removeListValue('hairTypes', v)} />
                        </SectionCard>
                        <SectionCard title="Hair Conditions" action={<PillButton icon={Plus} onClick={() => addListValue('hairConditions')}>Add Condition</PillButton>}>
                            <TagList items={configs.hairConditions} onRemove={v => removeListValue('hairConditions', v)} />
                        </SectionCard>
                    </div>
                    <SectionCard title="Scan Metrics" action={<PillButton icon={Plus} onClick={() => addListValue('scanMetrics')}>Add Metric</PillButton>}>
                        <TagList items={configs.scanMetrics || []} onRemove={v => removeListValue('scanMetrics', v)} />
                    </SectionCard>
                </div>
            )}

            {/* Hair Colors */}
            {activeTab === 'colors' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <SectionCard
                        title="Visual Hair Colors"
                        action={
                            <PillButton icon={Plus} onClick={() => {
                                const name = prompt('Enter color name:');
                                if (name) setConfigs({ ...configs, hairColors: [...(configs.hairColors || []), { id: Date.now().toString(), name, imageUrl: '' }] });
                            }}>Add Color</PillButton>
                        }
                    >
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {(configs.hairColors || []).map(color => (
                                <div key={color.id} className="relative group glass-card p-3 space-y-3 overflow-hidden border border-tea-100">
                                    <button
                                        onClick={() => setConfigs({ ...configs, hairColors: configs.hairColors.filter(c => c.id !== color.id) })}
                                        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="aspect-square bg-tea-50 rounded-xl overflow-hidden relative">
                                        <ImageWithFallback
                                            src={color.imageUrl}
                                            alt={color.name}
                                            className="w-full h-full object-cover"
                                            fallbackClassName="w-full h-full flex items-center justify-center p-6 opacity-20"
                                        />
                                        <label className="absolute inset-0 bg-tea-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={async e => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const url = await uploadImage(file, `config/colors/${file.name}`);
                                                        const updated = configs.hairColors.map(c => c.id === color.id ? { ...c, imageUrl: url } : c);
                                                        setConfigs({ ...configs, hairColors: updated });
                                                    }
                                                }}
                                            />
                                            <Upload className="w-5 h-5 text-white" />
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        value={color.name}
                                        onChange={e => {
                                            const updated = configs.hairColors.map(c => c.id === color.id ? { ...c, name: e.target.value } : c);
                                            setConfigs({ ...configs, hairColors: updated });
                                        }}
                                        className="w-full text-center text-xs font-black text-tea-800 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-tea-200 rounded-lg p-1 uppercase tracking-widest"
                                    />
                                </div>
                            ))}
                            {(!configs.hairColors || configs.hairColors.length === 0) && (
                                <div className="col-span-full py-12 text-center">
                                    <Droplets className="w-10 h-10 text-tea-200 mx-auto mb-3" />
                                    <p className="text-tea-400 text-xs font-black uppercase tracking-widest">No colors added yet</p>
                                </div>
                            )}
                        </div>
                    </SectionCard>
                </div>
            )}

            {/* App Layout */}
            {activeTab === 'home' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <SectionCard title="Home Screen Banner">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-3">
                                <div className="aspect-video bg-tea-50 rounded-2xl overflow-hidden relative group border-2 border-dashed border-tea-200">
                                    <ImageWithFallback
                                        src={configs.homeBanner?.imageUrl}
                                        alt="Banner"
                                        className="w-full h-full object-cover"
                                        fallbackClassName="w-full h-full flex items-center justify-center p-12 opacity-20"
                                    />
                                    <label className="absolute inset-0 bg-tea-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer gap-2">
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={async e => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const url = await uploadImage(file, `config/banner/${file.name}`);
                                                    setConfigs({ ...configs, homeBanner: { ...configs.homeBanner, imageUrl: url } });
                                                }
                                            }}
                                        />
                                        <Upload className="w-7 h-7 text-white" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Upload Image</span>
                                    </label>
                                </div>
                                <p className="text-[10px] text-tea-400 font-black uppercase tracking-widest text-center">Recommended: 1200×600px</p>
                            </div>
                            <div className="space-y-4">
                                <FieldGroup label="Banner Title">
                                    <input
                                        type="text"
                                        value={configs.homeBanner?.title || ''}
                                        onChange={e => setConfigs({ ...configs, homeBanner: { ...configs.homeBanner, title: e.target.value } })}
                                        className="input-field"
                                        placeholder="e.g. Appointment"
                                    />
                                </FieldGroup>
                                <FieldGroup label="Banner Subtitle">
                                    <input
                                        type="text"
                                        value={configs.homeBanner?.subtitle || ''}
                                        onChange={e => setConfigs({ ...configs, homeBanner: { ...configs.homeBanner, subtitle: e.target.value } })}
                                        className="input-field"
                                        placeholder="e.g. Lahore, Pakistan"
                                    />
                                </FieldGroup>
                                <label className="flex items-center gap-3 cursor-pointer p-4 bg-tea-50/60 rounded-xl border border-tea-100 hover:border-tea-200 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={configs.homeBanner?.showStats || false}
                                        onChange={e => setConfigs({ ...configs, homeBanner: { ...configs.homeBanner, showStats: e.target.checked } })}
                                        className="w-4 h-4 accent-tea-700 rounded"
                                    />
                                    <div>
                                        <p className="text-xs font-black text-tea-800 uppercase tracking-widest">Display Live Activity Stats</p>
                                        <p className="text-[10px] text-tea-400 font-bold">Show real-time salon metrics on banner</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Quick Action Categories">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {configs.homeCategories.map((cat, idx) => (
                                <div key={cat.id} className="p-5 bg-tea-50/60 border border-tea-100 rounded-2xl space-y-3">
                                    <FieldGroup label="Category Label">
                                        <input
                                            type="text"
                                            value={cat.label}
                                            onChange={e => {
                                                const updated = configs.homeCategories.map((c, i) => i === idx ? { ...c, label: e.target.value } : c);
                                                setConfigs({ ...configs, homeCategories: updated });
                                            }}
                                            className="input-field h-10"
                                        />
                                    </FieldGroup>
                                    <div>
                                        <p className="text-[10px] font-black text-tea-500 uppercase tracking-widest mb-1">Internal Key</p>
                                        <p className="font-mono text-xs text-tea-400 bg-tea-100/60 px-3 py-1.5 rounded-lg">{cat.id}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            )}

            {/* Salon Profile */}
            {activeTab === 'salon' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <SectionCard title="Salon Profile & Identity">
                        <div className="flex flex-col items-center gap-4 pb-6 mb-6 border-b border-tea-100">
                            <div className="relative group w-28 h-28 bg-tea-50 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
                                <ImageWithFallback
                                    src={configs.salonInfo?.logoUrl}
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                    fallbackClassName="w-full h-full flex items-center justify-center p-6 opacity-20"
                                />
                                <label className="absolute inset-0 bg-tea-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer gap-1">
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={async e => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const url = await uploadImage(file, `salon/logo/${file.name}`);
                                                setConfigs({ ...configs, salonInfo: { ...configs.salonInfo, logoUrl: url } });
                                            }
                                        }}
                                    />
                                    <Upload className="w-5 h-5 text-white" />
                                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Upload</span>
                                </label>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-black text-tea-800 uppercase tracking-widest">Company Logo</p>
                                <p className="text-[10px] text-tea-400 font-bold">Applies to app header and reports</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FieldGroup label="Salon Name">
                                <input type="text" value={configs.salonInfo?.name || ''} onChange={e => setConfigs({ ...configs, salonInfo: { ...configs.salonInfo, name: e.target.value } })} className="input-field" />
                            </FieldGroup>
                            <FieldGroup label="Primary Location">
                                <input type="text" value={configs.salonInfo?.location || ''} onChange={e => setConfigs({ ...configs, salonInfo: { ...configs.salonInfo, location: e.target.value } })} className="input-field" />
                            </FieldGroup>
                            <FieldGroup label="Public Phone Number">
                                <input type="text" value={configs.salonInfo?.phone || ''} onChange={e => setConfigs({ ...configs, salonInfo: { ...configs.salonInfo, phone: e.target.value } })} className="input-field" />
                            </FieldGroup>
                            <FieldGroup label="Owner / Manager Name">
                                <input type="text" value={configs.salonInfo?.owner || ''} onChange={e => setConfigs({ ...configs, salonInfo: { ...configs.salonInfo, owner: e.target.value } })} className="input-field" />
                            </FieldGroup>
                        </div>
                    </SectionCard>
                </div>
            )}

            {/* Support */}
            {activeTab === 'support' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <SectionCard title="Support Contact Settings">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 bg-tea-50/60 border border-tea-100 rounded-2xl space-y-3">
                                <FieldGroup label="Support Email">
                                    <input
                                        type="email"
                                        value={configs.supportEmail || ''}
                                        onChange={e => setConfigs({ ...configs, supportEmail: e.target.value })}
                                        className="input-field"
                                        placeholder="support@example.com"
                                    />
                                </FieldGroup>
                            </div>
                            <div className="p-5 bg-tea-50/60 border border-tea-100 rounded-2xl space-y-3">
                                <FieldGroup label="Support Phone">
                                    <input
                                        type="text"
                                        value={configs.supportPhone || ''}
                                        onChange={e => setConfigs({ ...configs, supportPhone: e.target.value })}
                                        className="input-field"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </FieldGroup>
                            </div>
                        </div>
                    </SectionCard>
                </div>
            )}

            {/* Legal */}
            {activeTab === 'business' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <SectionCard title="Legal & Business Content">
                        <div className="space-y-6">
                            <FieldGroup label="Terms & Conditions">
                                <textarea
                                    value={configs.termsAndConditions || ''}
                                    onChange={e => setConfigs({ ...configs, termsAndConditions: e.target.value })}
                                    className="input-field min-h-[200px] py-4"
                                    placeholder="Enter terms and conditions content..."
                                />
                            </FieldGroup>
                            <FieldGroup label="Privacy Policy">
                                <textarea
                                    value={configs.privacyPolicy || ''}
                                    onChange={e => setConfigs({ ...configs, privacyPolicy: e.target.value })}
                                    className="input-field min-h-[200px] py-4"
                                    placeholder="Enter privacy policy content..."
                                />
                            </FieldGroup>
                        </div>
                    </SectionCard>
                </div>
            )}
        </div>
    );
};

// ─── Reusable sub-components ───────────────────────────────────────────────

const SectionCard = ({ title, action, children }) => (
    <div className="glass-card p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-tea-100 pb-4">
            <h3 className="text-xl font-black text-tea-900 uppercase tracking-tight">{title}</h3>
            {action}
        </div>
        {children}
    </div>
);

const PillButton = ({ icon: Icon, onClick, children }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tea-50 border border-tea-200 text-tea-700 text-[10px] font-black uppercase tracking-widest hover:bg-tea-100 hover:border-tea-300 transition-all"
    >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {children}
    </button>
);

const TagList = ({ items, onRemove }) => (
    <div className="flex flex-wrap gap-2">
        {items.map(item => (
            <div key={item} className="flex items-center gap-2 px-4 py-2 bg-white border border-tea-100 rounded-xl shadow-sm group/tag hover:border-tea-200 transition-colors">
                <span className="text-xs font-black text-tea-800 uppercase tracking-wider">{item}</span>
                <button
                    onClick={() => onRemove(item)}
                    className="text-tea-300 hover:text-rose-500 transition-colors"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        ))}
        {items.length === 0 && (
            <p className="text-[10px] font-bold text-tea-400 italic">No items yet — add one above</p>
        )}
    </div>
);

const FieldGroup = ({ label, children }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-tea-700 uppercase tracking-widest ml-1">{label}</label>
        {children}
    </div>
);

export default AppConfig;
