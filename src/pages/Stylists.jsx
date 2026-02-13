import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Eye,
    UserX,
    Check,
    X,
    Loader2
} from 'lucide-react';
import {
    subscribeToCollection,
    createDocument,
    updateDocument
} from '../lib/services';

const Stylists = () => {
    const [stylists, setStylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
    const [selectedStylist, setSelectedStylist] = useState(null);

    // Subscribe to real-time updates
    useEffect(() => {
        const unsubscribe = subscribeToCollection('stylists', (data) => {
            setStylists(data);
            setLoading(false);
        }, [], { field: 'createdAt', direction: 'desc' });

        return () => unsubscribe();
    }, []);

    const filteredStylists = stylists.filter(stylist => {
        const matchesSearch = stylist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stylist.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || stylist.status?.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleAdd = () => {
        setModalMode('add');
        setSelectedStylist(null);
        setShowModal(true);
    };

    const handleEdit = (stylist) => {
        setModalMode('edit');
        setSelectedStylist(stylist);
        setShowModal(true);
    };

    const handleView = (stylist) => {
        setModalMode('view');
        setSelectedStylist(stylist);
        setShowModal(true);
    };

    const handleDeactivate = async (stylist) => {
        try {
            await updateDocument('stylists', stylist.id, {
                status: stylist.status === 'Active' ? 'Inactive' : 'Active'
            });
        } catch (error) {
            console.error("Error toggling status:", error);
            alert("Failed to update stylist status");
        }
    };

    const handleSave = async (data) => {
        try {
            if (modalMode === 'add') {
                await createDocument('stylists', data);
            } else if (modalMode === 'edit') {
                // Don't update password if it's empty (placeholder: "Leave blank to keep current")
                const updateData = { ...data };
                if (!updateData.password) {
                    delete updateData.password;
                }
                await updateDocument('stylists', selectedStylist.id, updateData);
            }
            setShowModal(false);
        } catch (error) {
            console.error("Error saving stylist:", error);
            alert("Failed to save stylist");
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="h-10 w-64 skeleton rounded-lg" />
                        <div className="h-4 w-48 skeleton rounded-lg" />
                    </div>
                    <div className="h-10 w-40 skeleton rounded-lg" />
                </div>

                <div className="card h-16 skeleton rounded-xl" />

                <div className="card overflow-hidden">
                    <div className="space-y-4 p-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <div className="w-10 h-10 skeleton rounded-full" />
                                <div className="flex-1 h-8 skeleton rounded" />
                                <div className="w-48 h-8 skeleton rounded" />
                                <div className="w-32 h-8 skeleton rounded" />
                                <div className="w-24 h-8 skeleton rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-tea-800">Stylist Management</h1>
                    <p className="text-gray-600 mt-1">Manage your salon stylists</p>
                </div>
                <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Stylist
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-field md:w-48"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Stylists Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-tea-50">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Sales</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Units Sold</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStylists.map((stylist) => (
                                <tr key={stylist.id} className="border-b border-gray-100 hover:bg-tea-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center text-tea-700 font-semibold text-sm">
                                                {stylist.name?.split(' ').map(n => n[0]).join('') || '?'}
                                            </div>
                                            <span className="font-medium text-gray-900">{stylist.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-700">{stylist.email}</td>
                                    <td className="py-3 px-4 text-gray-700">{stylist.phone}</td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${stylist.status === 'Active'
                                            ? 'bg-tea-100 text-tea-800'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {stylist.status === 'Active' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                            {stylist.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right font-semibold text-tea-700">
                                        ${stylist.totalSales?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-700">{stylist.unitsSold}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleView(stylist)}
                                                className="p-2 text-gray-600 hover:bg-tea-100 rounded-lg transition-colors"
                                                title="View Profile"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(stylist)}
                                                className="p-2 text-tea-700 hover:bg-brown-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeactivate(stylist)}
                                                className={`p-2 rounded-lg transition-colors ${stylist.status === 'Active'
                                                    ? 'text-red-600 hover:bg-red-50'
                                                    : 'text-tea-700 hover:bg-tea-50'
                                                    }`}
                                                title={stylist.status === 'Active' ? 'Deactivate' : 'Activate'}
                                            >
                                                <UserX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredStylists.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-48 h-48 mb-6 opacity-80">
                            <img src="/empty.png" alt="No stylists" className="w-full h-full object-contain filter grayscale" />
                        </div>
                        <h3 className="text-xl font-bold text-tea-800 mb-2">No Stylists Found</h3>
                        <p className="text-gray-600 max-w-xs mx-auto">
                            No team members are currently registered. Add your stylists to start tracking their performance and AI recommendations.
                        </p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <StylistModal
                    mode={modalMode}
                    stylist={selectedStylist}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

const StylistModal = ({ mode, stylist, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        status: 'Active',
        totalSales: 0,
        unitsSold: 0,
        password: '',
        ...stylist
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave(formData);
        setIsSubmitting(false);
    };

    const isViewMode = mode === 'view';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-tea-800 mb-6">
                        {mode === 'add' ? 'Add New Stylist' : mode === 'edit' ? 'Edit Stylist' : 'Stylist Profile'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-field"
                                disabled={isViewMode}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-field"
                                disabled={isViewMode}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="input-field"
                                disabled={isViewMode}
                                required
                            />
                        </div>

                        {!isViewMode && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-field"
                                    placeholder={mode === 'add' ? "Set password" : "Leave blank to keep current"}
                                    required={mode === 'add'}
                                />
                            </div>
                        )}

                        {!isViewMode && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        )}

                        {isViewMode && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Sales</label>
                                    <p className="text-lg font-semibold text-tea-700">
                                        ${formData.totalSales?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Units Sold</label>
                                    <p className="text-lg font-semibold text-gray-900">{formData.unitsSold}</p>
                                </div>
                            </>
                        )}

                        <div className="flex gap-3 pt-4">
                            {!isViewMode && (
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {mode === 'add' ? 'Add Stylist' : 'Save Changes'}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 btn-secondary"
                                disabled={isSubmitting}
                            >
                                {isViewMode ? 'Close' : 'Cancel'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Stylists;
