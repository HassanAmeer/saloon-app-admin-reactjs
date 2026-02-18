import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Database,
    RefreshCcw,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Loader2,
    Activity
} from 'lucide-react';
import { initializeData } from '../lib/services';
import * as mockData from '../data-migration/mockData';

const Seeding = () => {
    const [status, setStatus] = useState('idle'); // idle, running, complete, error
    const [progress, setProgress] = useState([]);
    const [currentStep, setCurrentStep] = useState(null);
    const navigate = useNavigate();

    const handleSeeding = async () => {
        setStatus('running');
        setProgress([]);

        await initializeData(mockData, (update) => {
            if (update.status === 'complete') {
                setStatus('complete');
                setCurrentStep(null);
            } else if (update.status === 'error') {
                setStatus('error');
                setProgress(prev => [...prev, { ...update, icon: <XCircle className="w-5 h-5 text-red-500" /> }]);
            } else {
                setCurrentStep(update);
                if (update.status === 'success' || update.status === 'skipped') {
                    setProgress(prev => [...prev, {
                        ...update,
                        icon: update.status === 'success' ?
                            <CheckCircle2 className="w-5 h-5 text-green-500" /> :
                            <Activity className="w-5 h-5 text-blue-500" />
                    }]);
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-tea-700 to-tea-800">
                        <div className="flex items-center gap-4 text-white">
                            <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                                <img src="/logo.png" alt="salon Logo" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Database Migration</h1>
                                <p className="text-tea-100 opacity-90">Upload all data to Firebase</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">Migrate all data to Firebase</h2>
                            <p className="text-gray-600 text-sm">
                                This will migrate your stylists, products, sales, and recommendations to the Firestore database.
                                It only adds data if the collections are currently empty.
                            </p>
                        </div>

                        {status === 'idle' && (
                            <button
                                onClick={handleSeeding}
                                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-tea-700 hover:bg-tea-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-tea-700/20 group"
                            >
                                <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                Start Migration
                            </button>
                        )}

                        {status !== 'idle' && (
                            <div className="space-y-6">
                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-3 bg-white text-gray-500 font-medium">Migration Progress</span>
                                    </div>
                                </div>

                                {/* Progress List */}
                                <div className="space-y-3">
                                    {progress.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-2"
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.icon}
                                                <div>
                                                    <p className="font-medium text-gray-800">{item.label}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.status === 'success' ? `Successfully seeded ${item.count} items` : `Skipped (${item.count} existing documents)`}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-green-600">Done</span>
                                        </div>
                                    ))}

                                    {currentStep && (
                                        <div className="flex items-center justify-between p-4 bg-tea-50 rounded-xl border border-tea-100 animate-pulse">
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="w-5 h-5 text-tea-600 animate-spin" />
                                                <div>
                                                    <p className="font-medium text-tea-900">{currentStep.label}</p>
                                                    <p className="text-xs text-tea-600">Processing collection...</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-tea-600">In Progress</span>
                                        </div>
                                    )}
                                </div>

                                {status === 'complete' && (
                                    <div className="pt-4">
                                        <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-800 flex items-center gap-3 mb-6">
                                            <CheckCircle2 className="w-6 h-6" />
                                            <div>
                                                <p className="font-bold">Migration Complete!</p>
                                                <p className="text-sm">All data has been successfully synchronized with Firebase.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold transition-all shadow-lg"
                                        >
                                            Continue to Login
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}

                                {status === 'error' && (
                                    <div className="pt-4">
                                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-800 flex items-center gap-3 mb-6">
                                            <XCircle className="w-6 h-6" />
                                            <div>
                                                <p className="font-bold">Migration Failed</p>
                                                <p className="text-sm">Please check your internet connection or Firebase rules.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSeeding}
                                            className="w-full py-4 px-6 bg-gray-900 text-white rounded-xl font-semibold"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <p className="mt-6 text-center text-gray-500 text-sm">
                    salon Admin Panel &bull; v2.0 Firebase Integrated
                </p>
            </div>
        </div>
    );
};

export default Seeding;
