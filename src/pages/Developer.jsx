import { useState } from 'react';
import {
    Code2,
    Database,
    Download,
    RefreshCcw,
    Globe,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    BookOpen,
    ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Developer = () => {
    const navigate = useNavigate();
    const [backingUp, setBackingUp] = useState(false);
    const [backupStatus, setBackupStatus] = useState(null);

    const handleBackup = () => {
        setBackingUp(true);
        // Simulate backup process
        setTimeout(() => {
            setBackingUp(false);
            setBackupStatus('success');
            setTimeout(() => setBackupStatus(null), 3000);
        }, 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-tea-800">Developer Center</h1>
                <p className="text-gray-600 mt-1">Tools for system administration and data management</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Database Management Card */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Database className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-tea-800">Database & Seeding</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h3 className="font-semibold text-tea-800 mb-1">Data Seeding</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Populate your database with the latest mock data. Useful for resetting the environment or testing.
                            </p>
                            <button
                                onClick={() => navigate('/seeding')}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Go to Seeding Page
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h3 className="font-semibold text-tea-800 mb-1">JSON Backup</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Export your current Firestore collections to a JSON file for local backup.
                            </p>
                            <button
                                onClick={handleBackup}
                                disabled={backingUp}
                                className="btn-secondary w-full flex items-center justify-center gap-2"
                            >
                                {backingUp ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : backupStatus === 'success' ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                {backingUp ? 'Processing...' : backupStatus === 'success' ? 'Backup Ready' : 'Generate Backup'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* API Management Card */}
                <div className="card h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-tea-800">API Management</h2>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Total API Endpoints</p>
                                <p className="text-2xl font-bold text-tea-800">12 Available</p>
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 px-2 py-1 bg-green-100 rounded-full">
                                <ShieldCheck className="w-3 h-3" />
                                ACTIVE
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[
                                { method: 'GET', count: 5, color: 'text-blue-600 bg-blue-50' },
                                { method: 'POST', count: 4, color: 'text-green-600 bg-green-50' },
                                { method: 'PUT', count: 2, color: 'text-orange-600 bg-orange-50' },
                                { method: 'DELETE', count: 1, color: 'text-red-600 bg-red-50' }
                            ].map((item) => (
                                <div key={item.method} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${item.color}`}>{item.method}</span>
                                    <span className="text-sm font-semibold text-gray-700">{item.count} Methods</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto space-y-4">
                            <div className="p-4 bg-brown-50 rounded-xl border border-brown-100">
                                <p className="text-xs text-tea-800 mb-3 leading-relaxed">
                                    Access our full technical reference, including endpoint parameters,
                                    request bodies, and client-side integration guides.
                                </p>
                                <button
                                    onClick={() => navigate('/developer/api-docs')}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-tea-700 text-tea-700 rounded-lg font-bold hover:bg-tea-700 hover:text-white transition-all group"
                                >
                                    <BookOpen className="w-5 h-5" />
                                    Explore API Documentation
                                    <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Warnings */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                    <h4 className="font-bold text-amber-800">Warning: Developer Mode</h4>
                    <p className="text-sm text-amber-700">
                        Seeding data will overwrite any existing records in your Firestore collections.
                        Always generate a backup before performing destructive operations in production-like environments.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Developer;
