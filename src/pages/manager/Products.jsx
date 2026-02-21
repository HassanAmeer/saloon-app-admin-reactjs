import { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Check,
    X,
    Upload,
    Loader2,
    Package,
    Tag,
    Layers,
    DollarSign,
    Box,
    Sparkles,
    Star,
    Info,
    ArrowRight,
    Bot
} from 'lucide-react';
import {
    subscribeToCollection,
    createDocument,
    updateDocument,
    deleteDocument,
    uploadImage
} from '../../lib/services';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import ImageWithFallback from '../../components/ImageWithFallback';
import { Skeleton } from '../../components/Skeleton';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const Products = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedProduct, setSelectedProduct] = useState(null);

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

    const categories = useMemo(() => ['all', ...new Set(products.map(p => p.category).filter(Boolean))], [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = !searchTerm ||
                product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && product.active) ||
                (statusFilter === 'inactive' && !product.active);
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [products, searchTerm, categoryFilter, statusFilter]);

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
                showToast('Product deleted successfully', 'success');
            } catch (error) {
                console.error("Error deleting product:", error);
                showToast('Failed to delete product', 'error');
            }
        }
    };

    const toggleActive = async (product) => {
        try {
            await updateDocument(salonPath, product.id, { active: !product.active });
            showToast(`Product ${product.active ? 'deactivated' : 'activated'}`, 'success');
        } catch (error) {
            console.error("Error toggling active status:", error);
            showToast('Failed to update status', 'error');
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

            const productData = { ...data, imageUrl, updatedAt: new Date() };
            if (modalMode === 'add') productData.createdAt = new Date();

            if (modalMode === 'add') {
                await createDocument(salonPath, productData);
                showToast('Product added successfully', 'success');
            } else {
                await updateDocument(salonPath, selectedProduct.id, productData);
                showToast('Product updated successfully', 'success');
            }
            setShowModal(false);
        } catch (error) {
            console.error("Error saving product:", error);
            showToast('Failed to save product', 'error');
        }
    };

    if (loading) {
        return (
            <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-2"><Skeleton className="h-12 w-72" /><Skeleton className="h-4 w-48" /></div>
                    <Skeleton className="h-12 w-48 rounded-2xl" />
                </div>
                <div className="glass-card p-4"><Skeleton className="h-14 w-full rounded-2xl" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="glass-card p-4 space-y-4">
                            <Skeleton className="h-48 w-full rounded-2xl" />
                            <div className="space-y-3">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/4" />
                                <div className="pt-4 flex gap-2"><Skeleton className="h-10 flex-1 rounded-xl" /><Skeleton className="h-10 w-10 rounded-xl" /></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl lg:text-5xl font-black text-tea-900 tracking-tight leading-none uppercase">
                        Product <span className="text-tea-700">Management</span>
                    </h1>
                    <p className="text-tea-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        Configure and curate your salon's product inventory
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="btn-primary flex items-center gap-3 px-8 h-12 rounded-2xl bg-tea-700 hover:bg-tea-800 shadow-lg shadow-tea-700/20"
                >
                    <Plus className="w-5 h-5" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Add Product</span>
                </button>
            </div>

            {/* Filters Row */}
            <div className="glass-card p-4 flex flex-col xl:flex-row gap-4 border border-tea-100">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tea-400" />
                    <input
                        type="text"
                        placeholder="Search by name, brand, or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-12 h-12 bg-white/50 border-tea-100"
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex items-center gap-2 p-1.5 glass-card bg-tea-50 border-tea-100 rounded-2xl overflow-x-auto">
                        <span className="text-[9px] font-black text-tea-300 uppercase tracking-widest px-3">Category</span>
                        <div className="flex gap-1">
                            {categories.slice(0, 5).map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={cn(
                                        'px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all',
                                        categoryFilter === cat ? 'bg-tea-700 text-white' : 'text-tea-900 hover:text-tea-800'
                                    )}
                                >
                                    {cat === 'all' ? 'All' : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-1.5 glass-card bg-tea-50 border-tea-100 rounded-2xl">
                        <span className="text-[9px] font-black text-tea-400 uppercase tracking-widest px-3">Status</span>
                        <div className="flex gap-1">
                            {['all', 'active', 'inactive'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={cn(
                                        'px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all',
                                        statusFilter === s ? 'bg-tea-700 text-white' : 'text-tea-900 hover:text-tea-800'
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="group glass-card border border-tea-100 p-3 hover:border-tea-300 transition-all duration-300 hover:shadow-2xl hover:shadow-tea-900/10 flex flex-col">
                        {/* Image Container */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-tea-50 mb-4 border border-tea-50">
                            <ImageWithFallback
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                fallbackClassName="w-full h-full flex items-center justify-center p-12 opacity-20 grayscale"
                            />
                            {/* Badges Overlay */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                {product.aiEnabled && (
                                    <div className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1.5 shadow-sm">
                                        <Bot className="w-3 h-3 text-indigo-500" />
                                        <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">AI Ready</span>
                                    </div>
                                )}
                                {product.preSelected && (
                                    <div className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-1.5 shadow-sm">
                                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                        <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Featured</span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-3 right-3">
                                <span className={cn(
                                    "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md shadow-sm",
                                    product.active ? "bg-emerald-500/80 text-white" : "bg-rose-500/80 text-white"
                                )}>
                                    {product.active ? "Active" : "Hidden"}
                                </span>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="px-1 space-y-4 flex-1 flex flex-col">
                            <div>
                                <div className="flex justify-between items-start gap-4 mb-1">
                                    <p className="text-[9px] font-black text-tea-400 uppercase tracking-[0.2em]">{product.brand}</p>
                                    <p className="text-sm font-black text-tea-900 tracking-tighter">${product.price?.toFixed(2)}</p>
                                </div>
                                <h3 className="text-lg font-black text-tea-900 leading-tight uppercase tracking-tight group-hover:text-tea-700 transition-colors">
                                    {product.name}
                                </h3>
                            </div>

                            <div className="flex flex-wrap gap-1.5 min-h-[22px]">
                                <Badge icon={Layers} label={product.category} color="tea" />
                                <Badge icon={Box} label={`Stock: ${product.inventory || 0}`} color="brown" />
                            </div>

                            <p className="text-[11px] font-bold text-tea-500 leading-relaxed line-clamp-2">
                                {product.description || 'No description provided for this catalog item.'}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-tea-100 mt-auto">
                                <div className="flex gap-1">
                                    <ActionIcon icon={Edit} onClick={() => handleEdit(product)} color="tea" />
                                    <ActionIcon icon={Trash2} onClick={() => handleDelete(product.id)} color="rose" />
                                </div>
                                <button
                                    onClick={() => toggleActive(product)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                        product.active ? "bg-tea-50 text-tea-700 hover:bg-tea-100" : "bg-tea-700 text-white"
                                    )}
                                >
                                    {product.active ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                    {product.active ? 'Disable' : 'Enable'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
                <div className="glass-card py-32 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-tea-50 flex items-center justify-center mb-6">
                        <Package className="w-10 h-10 text-tea-200" />
                    </div>
                    <h3 className="text-2xl font-black text-tea-900 uppercase tracking-tight mb-2">Inventory Empty</h3>
                    <p className="text-tea-400 text-xs font-bold uppercase tracking-widest max-w-sm">
                        No products match your current filters. Start adding items to build your professional salon catalog.
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

// ─── Sub-components ───────────────────────────────────────────────────────

const Badge = ({ icon: Icon, label, color }) => (
    <span className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border shrink-0",
        color === 'tea' ? "bg-tea-50 text-tea-700 border-tea-100" : "bg-amber-50 text-amber-800 border-amber-100"
    )}>
        <Icon className="w-2.5 h-2.5" />
        {label}
    </span>
);

const ActionIcon = ({ icon: Icon, onClick, color }) => (
    <button
        onClick={onClick}
        className={cn(
            "p-2 rounded-xl border transition-all hover:scale-110",
            color === 'tea' ? "bg-tea-50 text-tea-600 border-tea-100 hover:bg-tea-100" : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
        )}
    >
        <Icon className="w-4 h-4" />
    </button>
);

const ProductModal = ({ mode, product, onClose, onSave }) => {
    const [formData, setFormData] = useState(product || {
        name: '', brand: '', category: 'Shampoo', price: 0, sku: '',
        description: '', inventory: 0, active: true, imageUrl: '',
        tags: [], aiEnabled: true, preSelected: false,
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(product?.imageUrl || null);
    const [tagInput, setTagInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
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
        <div className="fixed inset-0 bg-tea-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-8 pb-4 flex justify-between items-center border-b border-tea-100">
                    <div>
                        <h2 className="text-3xl font-black text-tea-900 uppercase tracking-tight">
                            {mode === 'add' ? 'New Product' : 'Edit Entry'}
                        </h2>
                        <p className="text-[10px] font-black text-tea-400 uppercase tracking-widest mt-1">Product details and AI metadata</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-tea-50 rounded-xl transition-colors"><X className="w-5 h-5 text-tea-400" /></button>
                </div>

                <form onSubmit={async (e) => { e.preventDefault(); setIsSubmitting(true); await onSave(formData, selectedFile); setIsSubmitting(false); }} className="p-8 pt-6 space-y-6 overflow-y-auto">
                    {/* Image Upload Area */}
                    <div className="relative group p-4 border-2 border-dashed border-tea-200 rounded-3xl bg-tea-50/50 flex flex-col items-center justify-center min-h-[160px] transition-colors hover:bg-tea-50 hover:border-tea-300">
                        {previewUrl ? (
                            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm"><Upload className="w-6 h-6 text-tea-300" /></div>
                                <div className="text-center">
                                    <p className="text-xs font-black text-tea-800 uppercase tracking-widest">Upload Frame</p>
                                    <p className="text-[9px] font-bold text-tea-400 uppercase mt-0.5">JPG, PNG up to 2MB</p>
                                </div>
                            </div>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FieldGroup label="Product Name" required>
                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" required />
                        </FieldGroup>
                        <FieldGroup label="Brand Label" required>
                            <input type="text" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="input-field" required />
                        </FieldGroup>
                        <FieldGroup label="Collection Category" required>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="input-field appearance-none">
                                <option value="Shampoo">Shampoo</option>
                                <option value="Conditioner">Conditioner</option>
                                <option value="Treatment">Treatment</option>
                                <option value="Styling">Styling</option>
                            </select>
                        </FieldGroup>
                        <FieldGroup label="Market Price ($)" required>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tea-300" />
                                <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} className="input-field pl-10" required />
                            </div>
                        </FieldGroup>
                        <FieldGroup label="SKU / Reference ID" required>
                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tea-300" />
                                <input type="text" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="input-field pl-10" required />
                            </div>
                        </FieldGroup>
                        <FieldGroup label="Current Inventory">
                            <div className="relative">
                                <Box className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tea-300" />
                                <input type="number" value={formData.inventory} onChange={e => setFormData({ ...formData, inventory: parseInt(e.target.value) })} className="input-field pl-10" />
                            </div>
                        </FieldGroup>
                    </div>

                    <FieldGroup label="Professional Description">
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input-field min-h-[100px] py-4" rows="3" />
                    </FieldGroup>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-tea-700 uppercase tracking-widest ml-1">Contextual Tags (AI Matching)</label>
                        <div className="flex gap-2">
                            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className="input-field h-10 flex-1" placeholder="e.g. dry hair, keratin..." />
                            <button type="button" onClick={addTag} className="btn-primary h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest">Apply</button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[30px]">
                            {formData.tags?.map((tag, idx) => (
                                <span key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-tea-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-amber-300 transition-colors"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Flags */}
                    <div className="flex flex-wrap gap-6 pt-2">
                        <Checkbox label="Active Status" checked={formData.active} onChange={v => setFormData({ ...formData, active: v })} />
                        <Checkbox label="AI Recommended" checked={formData.aiEnabled} onChange={v => setFormData({ ...formData, aiEnabled: v })} />
                        <Checkbox label="Featured Item" checked={formData.preSelected} onChange={v => setFormData({ ...formData, preSelected: v })} />
                    </div>

                    <div className="flex gap-4 pt-4 sticky bottom-0 bg-white py-4 border-t border-tea-50">
                        <button type="submit" className="flex-1 btn-primary h-14 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-tea-700/20" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                            <span className="text-xs font-black uppercase tracking-widest">{mode === 'add' ? 'Initialize Product' : 'Synchronize Changes'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const FieldGroup = ({ label, children, required }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-tea-700 uppercase tracking-widest ml-1">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {children}
    </div>
);

const Checkbox = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-2.5 cursor-pointer group">
        <div className={cn(
            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
            checked ? "bg-tea-700 border-tea-700" : "bg-white border-tea-200 group-hover:border-tea-400"
        )}>
            {checked && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
        </div>
        <input type="checkbox" className="hidden" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="text-[10px] font-black text-tea-800 uppercase tracking-widest">{label}</span>
    </label>
);

export default Products;
