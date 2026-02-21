import { useState, useEffect } from 'react';
import {
    Database,
    Download,
    FileJson,
    FileSpreadsheet,
    RefreshCcw,
    CheckCircle2,
    XCircle,
    Loader2,
    Activity,
    Shield,
    HardDrive,
    Trash2,
    AlertTriangle,
    Check,
    Bot,
    Users,
    Building2,
    TrendingUp,
    Package
} from 'lucide-react';
import { initializeData, subscribeToCollection, subscribeToCollectionGroup } from '../../lib/services';
import * as mockData from '../../data-migration/mockData';
import { useToast } from '../../contexts/ToastContext';
import { db } from '../../lib/firebase';
import { collection, getDocs, collectionGroup, deleteDoc, doc, writeBatch } from 'firebase/firestore';

const SectionCard = ({ title, description, children, icon: Icon, color = "tea" }) => (
    <div className="glass-card p-8 space-y-6 flex flex-col h-full border border-tea-100/50">
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color === 'tea' ? 'bg-tea-100 text-tea-700' :
                color === 'rose' ? 'bg-rose-100 text-rose-700' :
                    'bg-blue-100 text-blue-700'
                }`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-lg font-black text-tea-900 uppercase tracking-tight">{title}</h3>
                <p className="text-[10px] font-black text-tea-400 uppercase tracking-widest">{description}</p>
            </div>
        </div>
        <div className="flex-1">{children}</div>
    </div>
);



const Settings = () => {
    const { showToast } = useToast();
    const [seedingStatus, setSeedingStatus] = useState('idle'); // idle, running, complete
    const [seedingProgress, setSeedingProgress] = useState([]);
    const [currentStep, setCurrentStep] = useState(null);
    const [exporting, setExporting] = useState(null); // collectionId or null
    const [isPurging, setIsDeletingAll] = useState(false);
    const [stats, setStats] = useState({
        salons: '--',
        managers: '--',
        stylists: '--',
        sales: '--'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const salonSnap = await getDocs(collection(db, 'salons'));
                const managerSnap = await getDocs(collection(db, 'salon_managers'));
                const stylistSnap = await getDocs(collectionGroup(db, 'stylists'));
                const salesSnap = await getDocs(collectionGroup(db, 'sales'));

                setStats({
                    salons: salonSnap.size.toLocaleString(),
                    managers: managerSnap.size.toLocaleString(),
                    stylists: stylistSnap.size.toLocaleString(),
                    sales: salesSnap.size.toLocaleString()
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, []);

    const handleSeeding = async () => {
        if (!window.confirm("This will populate the database with dummy data. Existing data will not be deleted, but duplicates might be created if IDs clash. Continue?")) return;

        setSeedingStatus('running');
        setSeedingProgress([]);

        await initializeData(mockData, (update) => {
            if (update.status === 'complete') {
                setSeedingStatus('complete');
                setCurrentStep(null);
                showToast("Migration completed successfully", "success");
            } else if (update.status === 'error') {
                setSeedingStatus('error');
                showToast("Migration failed: " + update.error, "error");
            } else {
                setCurrentStep(update);
                if (update.status === 'success' || update.status === 'skipped') {
                    setSeedingProgress(prev => [...prev, update]);
                }
            }
        });
    };

    const exportToJSON = async (collectionId, isGroup = false) => {
        setExporting(collectionId + '-json');
        try {
            let data = [];
            if (isGroup) {
                const querySnapshot = await getDocs(collectionGroup(db, collectionId));
                data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                const querySnapshot = await getDocs(collection(db, collectionId));
                data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${collectionId}_export_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            showToast(`Exported ${data.length} records to JSON`, "success");
        } catch (error) {
            console.error(error);
            showToast("Export failed", "error");
        } finally {
            setExporting(null);
        }
    };

    const exportAllData = async (format = 'json') => {
        setExporting('all-' + format);
        try {
            const targets = [
                { id: 'salons', group: false, name: 'Salons' },
                { id: 'salon_managers', group: false, name: 'Managers' },
                { id: 'stylists', group: true, name: 'Stylists' },
                { id: 'products', group: true, name: 'Products' },
                { id: 'sales', group: true, name: 'Sales' },
                { id: 'Ai recommendations', group: true, name: 'AI_Insights' }
            ];

            if (format === 'json') {
                const bundle = {};
                for (const target of targets) {
                    const snap = target.group ? await getDocs(collectionGroup(db, target.id)) : await getDocs(collection(db, target.id));
                    bundle[target.id] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                }
                const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `full_platform_backup_${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                showToast("Generated full platform JSON archive", "success");
            } else {
                // Batch CSV export logic
                showToast("Starting sequential CSV downloads...", "info");
                for (const target of targets) {
                    const snap = target.group ? await getDocs(collectionGroup(db, target.id)) : await getDocs(collection(db, target.id));
                    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    if (data.length > 0) {
                        const headers = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
                        const csv = [headers.join(','), ...data.map(row => headers.map(h => `"${('' + (row[h] || '')).replace(/"/g, '""')}"`).join(','))].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${target.name.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
                        link.click();
                        // Small delay to prevent browser block
                        await new Promise(r => setTimeout(r, 300));
                    }
                }
                showToast("All available CSV collections exported", "success");
            }
        } catch (error) {
            console.error(error);
            showToast("Global export failed", "error");
        } finally {
            setExporting(null);
        }
    };

    const purgePlatformData = async () => {
        const password = window.prompt("⚠️ CRITICAL ACTION: This will permanently delete ALL salons, stylists, products, and sales records. To proceed, please type 'DELETE ALL' below:");

        if (password !== 'DELETE ALL') {
            if (password !== null) showToast("Incorrect confirmation phrase", "error");
            return;
        }

        setIsDeletingAll(true);
        showToast("Initiating platform-wide purge...", "info");

        try {
            const groupsToPurge = ['stylists', 'products', 'sales', 'Ai recommendations', 'clients'];
            const rootsToPurge = ['salons', 'salon_managers'];

            for (const item of groupsToPurge) {
                const snap = await getDocs(collectionGroup(db, item));
                if (snap.size > 0) {
                    const batch = writeBatch(db);
                    snap.docs.forEach(d => batch.delete(d.ref));
                    await batch.commit();
                }
            }

            for (const item of rootsToPurge) {
                const snap = await getDocs(collection(db, item));
                if (snap.size > 0) {
                    const batch = writeBatch(db);
                    snap.docs.forEach(d => batch.delete(d.ref));
                    await batch.commit();
                }
            }

            showToast("Platform data purged successfully", "success");
            // Refresh stats
            const salonSnap = await getDocs(collection(db, 'salons'));
            const managerSnap = await getDocs(collection(db, 'salon_managers'));
            const stylistSnap = await getDocs(collectionGroup(db, 'stylists'));
            const salesSnap = await getDocs(collectionGroup(db, 'sales'));

            setStats({
                salons: salonSnap.size.toLocaleString(),
                managers: managerSnap.size.toLocaleString(),
                stylists: stylistSnap.size.toLocaleString(),
                sales: salesSnap.size.toLocaleString()
            });
        } catch (error) {
            console.error(error);
            showToast("Cleanup failed", "error");
        } finally {
            setIsDeletingAll(false);
        }
    };

    const exportToCSV = async (collectionId, isGroup = false) => {
        setExporting(collectionId + '-csv');
        try {
            let data = [];
            if (isGroup) {
                const querySnapshot = await getDocs(collectionGroup(db, collectionId));
                data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                const querySnapshot = await getDocs(collection(db, collectionId));
                data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }

            if (data.length === 0) {
                showToast("No data to export", "info");
                return;
            }

            const headers = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
            const csvRows = [];
            csvRows.push(headers.join(','));

            for (const row of data) {
                const values = headers.map(header => {
                    const val = row[header];
                    const escaped = ('' + (val || '')).replace(/"/g, '""');
                    return `"${escaped}"`;
                });
                csvRows.push(values.join(','));
            }

            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${collectionId}_export_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            showToast(`Exported ${data.length} records to CSV`, "success");
        } catch (error) {
            console.error(error);
            showToast("Export failed", "error");
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl lg:text-5xl font-black text-tea-900 tracking-tight leading-none uppercase">
                        Platform <span className="text-tea-700">Settings</span>
                    </h1>
                    <p className="text-tea-400 text-[10px] font-black uppercase tracking-widest mt-1">
                        Global configuration, data migrations, and system utilities
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Data Migration Card */}
                <SectionCard
                    title="Database Migration"
                    description="Populate Firestore with baseline dummy data"
                    icon={Database}
                    color="tea"
                >
                    <div className="space-y-6">
                        <div className="p-4 bg-tea-50/50 rounded-2xl border border-tea-100 text-[11px] font-bold text-tea-700 leading-relaxed uppercase tracking-wider">
                            This utility will iterate through all mock collections (Stylists, Products, Sales, etc.) and synchronize them with your active Firebase instance.
                        </div>

                        {seedingStatus === 'idle' && (
                            <button
                                onClick={handleSeeding}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-tea-700 hover:bg-tea-800 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-tea-700/20 group"
                            >
                                <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                                Start Baseline Migration
                            </button>
                        )}

                        {seedingStatus === 'running' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-tea-700 rounded-2xl text-white animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest">{currentStep?.label || 'Processing...'}</p>
                                            <p className="text-[8px] font-bold uppercase opacity-60">Synchronizing collection group</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black uppercase">Active</span>
                                </div>

                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                    {seedingProgress.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-tea-50 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                <span className="text-[10px] font-black text-tea-900 uppercase tracking-tight">{item.label}</span>
                                            </div>
                                            <span className="text-[8px] font-bold text-tea-400 uppercase tracking-widest">{item.count} Items</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {seedingStatus === 'complete' && (
                            <div className="space-y-4">
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                                        <Check className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-900 uppercase tracking-tight">Deployment Successful</p>
                                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Global data synchronization complete</p>
                                    </div>
                                </div>
                                <button onClick={() => setSeedingStatus('idle')} className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-tea-400 hover:text-tea-700 transition-colors">
                                    Perform Another Migration
                                </button>
                            </div>
                        )}
                    </div>
                </SectionCard>

                {/* System Health / Stats Card */}
                <SectionCard
                    title="System Overview"
                    description="Current platform scale and document count"
                    icon={Shield}
                    color="blue"
                >
                    <div className="grid grid-cols-2 gap-4 h-full">
                        <SystemStat label="Active Salons" value={stats.salons} icon={Building2} delay="0" />
                        <SystemStat label="Global Managers" value={stats.managers} icon={Shield} delay="50" />
                        <SystemStat label="Total Specialists" value={stats.stylists} icon={Users} delay="100" />
                        <SystemStat label="Historical Sales" value={stats.sales} icon={TrendingUp} delay="150" />
                    </div>
                </SectionCard>
            </div>

            {/* Export Center */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-10 border-t border-tea-100">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-tea-900 uppercase tracking-tight">
                        Data <span className="text-tea-700">Export Center</span>
                    </h2>
                    <p className="text-[9px] font-black text-tea-400 uppercase tracking-[0.2em]">Generate backups and portable data archives</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => exportAllData('json')}
                        disabled={exporting?.startsWith('all')}
                        className="h-12 px-6 bg-tea-900 hover:bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl shadow-tea-900/10 disabled:opacity-50"
                    >
                        {exporting === 'all-json' ? <Loader2 className="w-4 h-4 animate-spin text-tea-400" /> : <FileJson className="w-4 h-4 text-tea-400" />}
                        Export All (JSON)
                    </button>
                    <button
                        onClick={() => exportAllData('csv')}
                        disabled={exporting?.startsWith('all')}
                        className="h-12 px-6 bg-tea-100 hover:bg-tea-200 text-tea-900 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {exporting === 'all-csv' ? <Loader2 className="w-4 h-4 animate-spin text-tea-700" /> : <FileSpreadsheet className="w-4 h-4 text-tea-700" />}
                        Export All (CSV)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
                <ExportCard
                    title="Salons"
                    icon={Building2}
                    onJSON={() => exportToJSON('salons')}
                    onCSV={() => exportToCSV('salons')}
                    loadingJSON={exporting === 'salons-json'}
                    loadingCSV={exporting === 'salons-csv'}
                />
                <ExportCard
                    title="Managers"
                    icon={Shield}
                    onJSON={() => exportToJSON('salon_managers')}
                    onCSV={() => exportToCSV('salon_managers')}
                    loadingJSON={exporting === 'salon_managers-json'}
                    loadingCSV={exporting === 'salon_managers-csv'}
                />
                <ExportCard
                    title="Stylists"
                    icon={Users}
                    onJSON={() => exportToJSON('stylists', true)}
                    onCSV={() => exportToCSV('stylists', true)}
                    loadingJSON={exporting === 'stylists-json'}
                    loadingCSV={exporting === 'stylists-csv'}
                />
                <ExportCard
                    title="Products"
                    icon={Package}
                    onJSON={() => exportToJSON('products', true)}
                    onCSV={() => exportToCSV('products', true)}
                    loadingJSON={exporting === 'products-json'}
                    loadingCSV={exporting === 'products-csv'}
                />
                <ExportCard
                    title="Sales Records"
                    icon={TrendingUp}
                    onJSON={() => exportToJSON('sales', true)}
                    onCSV={() => exportToCSV('sales', true)}
                    loadingJSON={exporting === 'sales-json'}
                    loadingCSV={exporting === 'sales-csv'}
                />
                <ExportCard
                    title="AI Insights"
                    icon={Bot}
                    onJSON={() => exportToJSON('Ai recommendations', true)}
                    onCSV={() => exportToCSV('Ai recommendations', true)}
                    loadingJSON={exporting === 'Ai recommendations-json'}
                    loadingCSV={exporting === 'Ai recommendations-csv'}
                />
            </div>

            {/* Danger Zone */}
            <div className="pt-20">
                <div className="glass-card border-rose-100/50 border bg-rose-50/10 p-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-16 h-16 rounded-[2rem] bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-black text-rose-900 uppercase tracking-tight">Danger Zone</h3>
                        <p className="text-[11px] font-bold text-rose-500 uppercase tracking-widest mt-1">Irreversible administrative actions perform with extreme caution</p>
                    </div>
                    <button
                        onClick={purgePlatformData}
                        disabled={isPurging}
                        className="px-8 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-rose-600/20 flex items-center gap-3 disabled:opacity-50"
                    >
                        {isPurging ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        {isPurging ? 'Purging Systems...' : 'Delete All Data'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SystemStat = ({ label, value, icon: Icon, delay }) => (
    <div className={`p-6 glass-card bg-tea-50/10 border-transparent hover:border-tea-100 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-700 delay-${delay}`}>
        <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-tea-400">
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-tea-200 uppercase">Live</span>
        </div>
        <p className="text-2xl font-black text-tea-900 tracking-tighter">{value}</p>
        <p className="text-[9px] font-black text-tea-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
);

const ExportCard = ({ title, icon: Icon, onJSON, onCSV, loadingJSON, loadingCSV }) => (
    <div className="glass-card p-6 flex flex-col gap-6 hover:border-tea-200 transition-colors group">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-tea-50 text-tea-700 flex items-center justify-center group-hover:bg-tea-700 group-hover:text-white transition-colors duration-300">
                <Icon className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-tea-900 uppercase tracking-widest">{title}</h4>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <button
                onClick={onJSON}
                disabled={loadingJSON}
                className="flex items-center justify-center gap-2 h-12 bg-white border border-tea-100 rounded-xl text-[10px] font-black text-tea-700 uppercase tracking-widest hover:bg-tea-50 disabled:opacity-50 transition-all"
            >
                {loadingJSON ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileJson className="w-3.5 h-3.5" />}
                JSON
            </button>
            <button
                onClick={onCSV}
                disabled={loadingCSV}
                className="flex items-center justify-center gap-2 h-12 bg-white border border-tea-100 rounded-xl text-[10px] font-black text-tea-700 uppercase tracking-widest hover:bg-tea-50 disabled:opacity-50 transition-all"
            >
                {loadingCSV ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                CSV
            </button>
        </div>
    </div>
);

export default Settings;
