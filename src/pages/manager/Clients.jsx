import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    User,
    Calendar,
    ChevronRight,
    Loader2,
    MapPin,
    Droplets,
    History,
    CheckCircle
} from 'lucide-react';
import { subscribeToCollection, subscribeToCollectionGroup } from '../../lib/services';
import { useAuth } from '../../contexts/AuthContext';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);

    // Subscribe to real-time updates
    const { user } = useAuth();

    useEffect(() => {
        if (!user?.salonId) {
            setLoading(false);
            return;
        }

        const unsubscribeClients = subscribeToCollectionGroup('clients', (data) => {
            setClients(data);
            setLoading(false);
        }, [{ field: 'salonId', operator: '==', value: user.salonId }], { field: 'name', direction: 'asc' });

        const unsubscribeRecs = subscribeToCollectionGroup('Ai recommendations', (data) => {
            setRecommendations(data);
        }, [{ field: 'salonId', operator: '==', value: user.salonId }], { field: 'createdAt', direction: 'desc' });

        return () => {
            unsubscribeClients();
            unsubscribeRecs();
        };
    }, [user?.salonId]);

    const filteredClients = clients.filter(client =>
        client.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const clientHistory = selectedClient
        ? recommendations.filter(rec => (rec.clientId || rec.clientName) === selectedClient.id)
        : [];

    if (loading) {
        return (

            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="h-10 w-64 skeleton rounded-lg" />
                        <div className="h-4 w-96 skeleton rounded-lg" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-4">
                        <div className="h-12 w-full skeleton rounded-lg" />
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-20 w-full skeleton rounded-xl" />
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card h-48 skeleton rounded-xl" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="card h-32 skeleton rounded-xl" />
                            <div className="card h-32 skeleton rounded-xl" />
                        </div>
                        <div className="space-y-4">
                            <div className="h-8 w-48 skeleton rounded-lg" />
                            <div className="card h-40 skeleton rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-tea-800">Client Management</h1>
                    <p className="text-gray-600 mt-1">View and manage salon clients and their history</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Client List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find a client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>

                    <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                        {filteredClients.map((client) => (
                            <div
                                key={client.id}
                                onClick={() => setSelectedClient(client)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${selectedClient?.id === client.id
                                    ? 'bg-tea-700 border-tea-700 text-white shadow-lg'
                                    : 'bg-white border-gray-100 hover:border-tea-200 text-gray-900 shadow-sm'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${selectedClient?.id === client.id ? 'bg-white/20' : 'bg-tea-100'
                                    }`}>
                                    <User className={`w-6 h-6 ${selectedClient?.id === client.id ? 'text-white' : 'text-tea-700'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold truncate">{client.name}</p>
                                    <p className={`text-xs truncate ${selectedClient?.id === client.id ? 'text-white/70' : 'text-gray-500'}`}>
                                        {client.totalVisits} visits • Last: {client.lastVisit ? new Date(client.lastVisit).toLocaleDateString() : 'Never'}
                                    </p>
                                </div>
                                <ChevronRight className={`w-5 h-5 shrink-0 ${selectedClient?.id === client.id ? 'text-white' : 'text-gray-300'}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Client Details */}
                <div className="lg:col-span-2">
                    {selectedClient ? (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Profile Card */}
                            <div className="card bg-white">
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                    <div className="w-24 h-24 bg-tea-100 rounded-full flex items-center justify-center">
                                        <User className="w-12 h-12 text-tea-700" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h2 className="text-2xl font-bold text-tea-800">{selectedClient.name}</h2>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {selectedClient.address}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Joined: {new Date(selectedClient.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-tea-50 px-4 py-2 rounded-lg border border-tea-100">
                                        <p className="text-xs text-tea-600 uppercase font-bold tracking-wider">Total Visits</p>
                                        <p className="text-2xl font-bold text-tea-800">{selectedClient.totalVisits}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Hair Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="card bg-white border-l-4 border-l-brown-500">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Droplets className="w-5 h-5 text-brown-500" />
                                        <h4 className="font-bold text-tea-800">Latest Hair Analysis</h4>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm">
                                            <span className="text-gray-500">Type:</span> {selectedClient.hairAnalysis?.type || 'N/A'}
                                        </p>
                                        <p className="text-sm">
                                            <span className="text-gray-500">Condition:</span> {selectedClient.hairAnalysis?.condition || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* History */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2">
                                    <History className="w-5 h-5 text-tea-700" />
                                    <h3 className="text-lg font-bold text-tea-800">Visit History</h3>
                                </div>
                                <div className="space-y-3">
                                    {clientHistory.map((rec, idx) => (
                                        <div key={idx} className="card bg-white hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <p className="font-bold text-tea-800">AI Recommendation Session</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(rec.date || rec.createdAt?.toDate()).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-mono">
                                                    #{rec.sessionId}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex flex-wrap gap-2">
                                                    {rec.suggestedProducts?.map((prod, pIdx) => (
                                                        <div key={pIdx} className="flex items-center gap-2 bg-tea-50 border border-tea-100 px-3 py-1.5 rounded-lg text-sm">
                                                            <span className="font-medium text-tea-800">{prod.productName}</span>
                                                            {prod.sold && <CheckCircle className="w-4 h-4 text-green-500" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                            <div className="w-20 h-20 bg-tea-50 rounded-full flex items-center justify-center mb-4">
                                <Users className="w-10 h-10 text-tea-300" />
                            </div>
                            <h3 className="text-xl font-bold text-tea-800 mb-2">Select a Client</h3>
                            <p className="text-gray-500 max-w-xs">
                                Choose a client from the list to view their detailed profile and session history.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Clients;
