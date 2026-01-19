import { useState, useEffect } from 'react';
import {
    Sparkles,
    Calendar,
    User,
    CheckCircle,
    XCircle,
    Loader2,
    BotIcon
} from 'lucide-react';
import { subscribeToCollection } from '../lib/services';

const AIRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('all');
    const [stylistFilter, setStylistFilter] = useState('all');
    const [selectedRec, setSelectedRec] = useState(null);

    // Subscribe to recommendations and stylists
    useEffect(() => {
        const unsubscribeRecs = subscribeToCollection('recommendations', (data) => {
            setRecommendations(data);
            setLoading(false);
        }, [], { field: 'createdAt', direction: 'desc' });

        const unsubscribeStylists = subscribeToCollection('stylists', (data) => {
            setStylists(data);
        });

        return () => {
            unsubscribeRecs();
            unsubscribeStylists();
        };
    }, []);

    const filteredRecommendations = recommendations.filter(rec => {
        const recDate = rec.createdAt?.toDate() || new Date(rec.date);
        const today = new Date();
        const matchesDate =
            dateFilter === 'all' ||
            (dateFilter === 'today' && recDate.toDateString() === today.toDateString()) ||
            (dateFilter === 'week' && recDate >= new Date(today.setDate(today.getDate() - 7))) ||
            (dateFilter === 'month' && recDate >= new Date(today.setMonth(today.getMonth() - 1)));

        const matchesStylist = stylistFilter === 'all' || rec.stylistId === stylistFilter;

        return matchesDate && matchesStylist;
    });

    const totalScans = filteredRecommendations.length;
    const totalSuggestions = filteredRecommendations.reduce((sum, rec) => sum + (rec.suggestedProducts?.length || 0), 0);
    const totalSold = filteredRecommendations.reduce((sum, rec) =>
        sum + (rec.suggestedProducts?.filter(p => p.sold).length || 0), 0
    );
    const conversionRate = totalSuggestions > 0 ? ((totalSold / totalSuggestions) * 100).toFixed(1) : 0;

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="space-y-1">
                    <div className="h-10 w-64 skeleton rounded-lg" />
                    <div className="h-4 w-48 skeleton rounded-lg" />
                </div>

                <div className="card h-16 skeleton rounded-xl" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card h-32 skeleton rounded-xl" />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card h-80 space-y-4">
                            <div className="flex gap-4 items-center mb-4">
                                <div className="w-12 h-12 skeleton rounded-lg" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-6 w-1/3 skeleton rounded" />
                                    <div className="h-4 w-1/4 skeleton rounded" />
                                </div>
                            </div>
                            <div className="h-20 w-full skeleton rounded-lg" />
                            <div className="space-y-2">
                                <div className="h-4 w-1/2 skeleton rounded" />
                                <div className="h-12 w-full skeleton rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-tea-800">AI Recommendations</h1>
                <p className="text-gray-600 mt-1">View AI-powered product suggestion history</p>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="input-field md:w-48"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>

                    <select
                        value={stylistFilter}
                        onChange={(e) => setStylistFilter(e.target.value)}
                        className="input-field md:w-64"
                    >
                        <option value="all">All Stylists</option>
                        {stylists.map(stylist => (
                            <option key={stylist.id} value={stylist.id}>{stylist.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Scans</p>
                            <p className="text-2xl font-bold text-tea-800">{totalScans}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                            <BotIcon className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Suggestions Made</p>
                            <p className="text-2xl font-bold text-tea-800">{totalSuggestions}</p>
                        </div>
                        <div className="w-12 h-12 bg-brown-100 text-tea-700 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Products Sold</p>
                            <p className="text-2xl font-bold text-tea-800">{totalSold}</p>
                        </div>
                        <div className="w-12 h-12 bg-tea-100 text-tea-700 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                            <p className="text-2xl font-bold text-tea-800">{conversionRate}%</p>
                        </div>
                        <div className="w-12 h-12 bg-tea-200 text-tea-700 rounded-lg flex items-center justify-center">
                            <User className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRecommendations.map((rec) => (
                    <div
                        key={rec.id}
                        className="card hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedRec(rec)}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <BotIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-tea-800">{rec.clientName}</p>
                                    <p className="text-sm text-gray-600">{rec.stylistName}</p>
                                </div>
                            </div>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                                {rec.sessionId}
                            </span>
                        </div>

                        {/* Date */}
                        <p className="text-sm text-gray-600 mb-3">
                            {(rec.createdAt?.toDate() || new Date(rec.date)).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>

                        {/* Hair Analysis */}
                        <div className="bg-tea-50 rounded-lg p-3 mb-4">
                            <p className="text-xs font-semibold text-tea-700 mb-1">Hair Analysis</p>
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">Type:</span> {rec.hairAnalysis?.type}
                            </p>
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">Condition:</span> {rec.hairAnalysis?.condition}
                            </p>
                        </div>

                        {/* Suggested Products */}
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                Suggested Products ({rec.suggestedProducts?.length || 0})
                            </p>
                            <div className="space-y-2">
                                {rec.suggestedProducts?.map((product, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{product.productName}</p>
                                            <p className="text-xs text-gray-600">Score: {(product.score * 100).toFixed(0)}%</p>
                                        </div>
                                        {product.sold ? (
                                            <CheckCircle className="w-5 h-5 text-tea-700" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Conversion Summary */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold text-tea-700">
                                    {rec.suggestedProducts?.filter(p => p.sold).length || 0}
                                </span>
                                {' '}of{' '}
                                <span className="font-semibold">
                                    {rec.suggestedProducts?.length || 0}
                                </span>
                                {' '}products sold
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {filteredRecommendations.length === 0 && (
                <div className="col-span-full card flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-56 h-56 mb-6 opacity-80">
                        <img src="/empty.png" alt="No recommendations" className="w-full h-full object-contain filter grayscale" />
                    </div>
                    <h3 className="text-xl font-bold text-tea-800 mb-2">No Recommendations Yet</h3>
                    <p className="text-gray-600 max-w-sm mx-auto">
                        AI analysis history will appear here once your stylists start using the recommendation engine with clients during their sessions.
                    </p>
                </div>
            )}

            {/* Detail Modal */}
            {selectedRec && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedRec(null)}
                >
                    <div
                        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-tea-800">Recommendation Details</h2>
                                <button
                                    onClick={() => setSelectedRec(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Session ID</p>
                                    <p className="text-gray-900 font-mono">{selectedRec.sessionId}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Client</p>
                                    <p className="text-gray-900">{selectedRec.clientName}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Stylist</p>
                                    <p className="text-gray-900">{selectedRec.stylistName}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Date & Time</p>
                                    <p className="text-gray-900">
                                        {(selectedRec.createdAt?.toDate() || new Date(selectedRec.date)).toLocaleString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                <div className="bg-tea-50 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-tea-800 mb-2">Hair Analysis</p>
                                    <p className="text-gray-700">
                                        <span className="font-medium">Type:</span> {selectedRec.hairAnalysis?.type}
                                    </p>
                                    <p className="text-gray-700">
                                        <span className="font-medium">Condition:</span> {selectedRec.hairAnalysis?.condition}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-3">AI Suggested Products</p>
                                    <div className="space-y-3">
                                        {selectedRec.suggestedProducts?.map((product, idx) => (
                                            <div key={idx} className="border border-gray-200 rounded-lg p-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{product.productName}</p>
                                                        <div className="flex items-center gap-4 mt-1">
                                                            <span className="text-sm text-gray-600">
                                                                Confidence: {(product.score * 100).toFixed(0)}%
                                                            </span>
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                                                                <div
                                                                    className="bg-tea-700 h-2 rounded-full"
                                                                    style={{ width: `${product.score * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        {product.sold ? (
                                                            <span className="inline-flex items-center gap-1 bg-tea-100 text-tea-800 px-2 py-1 rounded text-xs font-medium">
                                                                <CheckCircle className="w-3 h-3" />
                                                                Sold
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                                                                <XCircle className="w-3 h-3" />
                                                                Not Sold
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIRecommendations;
