import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Check,
    X,
    Upload,
    Loader2
} from 'lucide-react';
import {
    subscribeToCollection,
    createDocument,
    updateDocument,
    deleteDocument,
    uploadImage
} from '../../lib/services';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ImageWithFallback from '../../components/ImageWithFallback';
import { Skeleton } from '../../components/Skeleton';

const Products = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Get unique categories from products
    const categories = ['all', ...new Set(products.map(p => p.category))];
    const querySalonId = searchParams.get('salonId');
    const salonId = querySalonId || user?.salonId;
    const salonPath = salonId ? `salons/${salonId}/products` : null;

    useEffect(() => {
        if (!salonPath) {
            setLoading(false);
            return;
        }
        const unsubscribe = subscribeToCollection(salonPath, (data) => {
            setProducts(data);
            setLoading(false);
        }, [], { field: 'createdAt', direction: 'desc' });

        return () => unsubscribe();
    }, [salonPath]);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && product.active) ||
            (statusFilter === 'inactive' && !product.active);
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const handleAdd = () => {
        setModalMode('add');
        setSelectedProduct(null);
        setShowModal(true);
    };

    const handleEdit = (product) => {
        setModalMode('edit');
        setSelectedProduct(product);
        setShowModal(true);
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteDocument(salonPath, productId);
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product");
            }
        }
    };

    const toggleActive = async (product) => {
        try {
            await updateDocument(salonPath, product.id, { active: !product.active });
        } catch (error) {
            console.error("Error toggling active status:", error);
        }
    };

    const handleSave = async (data, file) => {
        try {
            let imageUrl = data.imageUrl;

            if (file) {
                const uploadedUrl = await uploadImage(file, `products/${Date.now()}_${file.name}`);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                } else {
                    throw new Error("Image upload failed");
                }
            }

            const productData = { ...data, imageUrl, salonId: user.salonId };

            if (modalMode === 'add') {
                await createDocument(salonPath, productData);
            } else {
                await updateDocument(salonPath, selectedProduct.id, productData);
            }
            setShowModal(false);
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product");
        }
    };

    if (loading) {
        return (
            <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-64 lg:w-96" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-12 w-48 rounded-xl" />
                </div>

                <div className="glass-card p-4">
                    <Skeleton className="h-14 w-full rounded-2xl" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="glass-card p-2 space-y-4">
                            <Skeleton className="h-48 w-full rounded-xl" />
                            <div className="p-4 space-y-3">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/4" />
                                <div className="pt-4 flex gap-2">
                                    <Skeleton className="h-10 flex-1 rounded-xl" />
                                    <Skeleton className="h-10 w-10 rounded-xl" />
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-tea-800">Product Management</h1>
                    <p className="text-gray-600 mt-1">Manage your salon product catalog</p>
                </div>
                <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, brand, or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="input-field md:w-48"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat === 'all' ? 'All Categories' : cat}
                            </option>
                        ))}
                    </select>

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

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="card hover:shadow-lg transition-shadow duration-200">
                        {/* Product Image */}
                        <div className="w-full h-48 scale-110 bg-gray-50 rounded-lg mb-2 flex items-center justify-center overflow-hidden border border-gray-100 p-1">
                            <ImageWithFallback
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                fallbackClassName="w-full h-full object-contain p-8 opacity-50 grayscale shrink-0"
                            />
                        </div>

                        {/* Product Info */}
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-lg font-semibold text-tea-800">{product.name}</h3>
                                <p className="text-sm text-gray-600">{product.brand}</p>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-xs bg-tea-100 text-tea-700 px-2 py-1 rounded">
                                    {product.category}
                                </span>
                                <span className="text-lg font-bold text-tea-700">
                                    ${product.price?.toFixed(2)}
                                </span>
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span>SKU: {product.sku}</span>
                                <span>•</span>
                                <span>Stock: {product.inventory}</span>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1">
                                {product.tags?.slice(0, 3).map((tag, idx) => (
                                    <span key={idx} className="text-xs bg-brown-50 text-tea-800 px-2 py-0.5 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Status Badges */}
                            <div className="flex gap-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${product.active ? 'bg-tea-100 text-tea-800' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {product.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                    {product.active ? 'Active' : 'Inactive'}
                                </span>
                                {product.aiEnabled && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                                        ✨ AI Enabled
                                    </span>
                                )}
                                {product.preSelected && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                        ⭐ Pre-selected
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="flex-1 btn-secondary text-sm py-2"
                                >
                                    <Edit className="w-4 h-4 inline mr-1" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => toggleActive(product)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${product.active
                                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        : 'bg-tea-100 hover:bg-tea-200 text-tea-800'
                                        }`}
                                    title={product.active ? 'Deactivate' : 'Activate'}
                                >
                                    {product.active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="card flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-64 h-64 mb-6 opacity-80">
                        <ImageWithFallback src="/empty.png" alt="No products" className="w-full h-full object-contain filter grayscale" />
                    </div>
                    <h3 className="text-xl font-bold text-tea-800 mb-2">No Products Found</h3>
                    <p className="text-gray-600 max-w-sm">
                        Your product catalog is currently empty. Start by adding your first salon product to manage your inventory.
                    </p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <ProductModal
                    mode={modalMode}
                    product={selectedProduct}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

const ProductModal = ({ mode, product, onClose, onSave }) => {
    const [formData, setFormData] = useState(product || {
        name: '',
        brand: '',
        category: 'Shampoo',
        price: 0,
        sku: '',
        description: '',
        inventory: 0,
        active: true,
        imageUrl: '',
        tags: [],
        aiEnabled: true,
        preSelected: false,
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(product?.imageUrl || null);
    const [tagInput, setTagInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave(formData, selectedFile);
        setIsSubmitting(false);
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-tea-800 mb-6">
                        {mode === 'add' ? 'Add New Product' : 'Edit Product'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Image Upload */}
                        <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                            {previewUrl ? (
                                <div className="relative w-32 h-32 mb-2 rounded-lg overflow-hidden border border-tea-100">
                                    <ImageWithFallback src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full shadow-md"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                                    <p className="text-xs text-gray-500 mb-2">JPG, PNG up to 2MB</p>
                                </div>
                            )}
                            <label className="btn-secondary text-sm cursor-pointer">
                                {previewUrl ? 'Change Image' : 'Upload Product Image'}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="input-field"
                                    required
                                >
                                    <option value="Shampoo">Shampoo</option>
                                    <option value="Conditioner">Conditioner</option>
                                    <option value="Treatment">Treatment</option>
                                    <option value="Styling">Styling</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SKU/Code *</label>
                                <input
                                    type="text"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Inventory</label>
                                <input
                                    type="number"
                                    value={formData.inventory}
                                    onChange={(e) => setFormData({ ...formData, inventory: parseInt(e.target.value) })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input-field"
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (for AI matching)</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    className="input-field flex-1"
                                    placeholder="e.g., dry hair, damaged"
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="btn-secondary"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags?.map((tag, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 bg-brown-100 text-tea-800 px-2 py-1 rounded text-sm">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-tea-900">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="w-4 h-4 text-tea-700 rounded focus:ring-brown-500"
                                />
                                <span className="text-sm text-gray-700">Active</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.aiEnabled}
                                    onChange={(e) => setFormData({ ...formData, aiEnabled: e.target.checked })}
                                    className="w-4 h-4 text-tea-700 rounded focus:ring-brown-500"
                                />
                                <span className="text-sm text-gray-700">AI Enabled</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.preSelected}
                                    onChange={(e) => setFormData({ ...formData, preSelected: e.target.checked })}
                                    className="w-4 h-4 text-tea-700 rounded focus:ring-brown-500"
                                />
                                <span className="text-sm text-gray-700">Pre-selected for AI</span>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="flex-1 btn-primary flex items-center justify-center gap-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {mode === 'add' ? 'Add Product' : 'Save Changes'}
                            </button>
                            <button type="button" onClick={onClose} className="flex-1 btn-secondary" disabled={isSubmitting}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Products;
