import { useState, useEffect } from 'react';
import {
    Calendar,
    DollarSign,
    Package,
    TrendingUp,
    Loader2
} from 'lucide-react';
import { subscribeToCollection } from '../../lib/services';
import { useAuth } from '../../contexts/AuthContext';

import { useSearchParams } from 'react-router-dom';
import ImageWithFallback from '../../components/ImageWithFallback';

const Sales = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [sales, setSales] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('all');
    const [stylistFilter, setStylistFilter] = useState('all');

    const querySalonId = searchParams.get('salonId');
    const salonId = querySalonId || user?.salonId;

    useEffect(() => {
        if (!salonId) {
            setLoading(false);
            return;
        }

        const unsubscribeSales = subscribeToCollection(`salons/${salonId}/sales`, (data) => {
            setSales(data);
            setLoading(false);
        }, [], { field: 'createdAt', direction: 'desc' });

        const unsubscribeStylists = subscribeToCollection(`salons/${salonId}/stylists`, (data) => {
            setStylists(data);
        });

        return () => {
            unsubscribeSales();
            unsubscribeStylists();
        };
    }, [salonId]);

    const filteredSales = sales.filter(sale => {
        const saleDate = sale.createdAt?.toDate() || new Date(sale.date);
        const today = new Date();
        const matchesDate =
            dateFilter === 'all' ||
            (dateFilter === 'today' && saleDate.toDateString() === today.toDateString()) ||
            (dateFilter === 'week' && saleDate >= new Date(today.setDate(today.getDate() - 7))) ||
            (dateFilter === 'month' && saleDate >= new Date(today.setMonth(today.getMonth() - 1)));

        const matchesStylist = stylistFilter === 'all' || sale.stylistId === stylistFilter;

        return matchesDate && matchesStylist;
    });

    const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || sale.total || 0), 0);
    const totalProducts = filteredSales.reduce((sum, sale) =>
        sum + (sale.products || sale.items || []).reduce((pSum, p) => pSum + (p.quantity || 1), 0), 0
    );
    const totalTransactions = filteredSales.length;
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="space-y-1">
                    <div className="h-10 w-64 skeleton shimmer rounded-lg" />
                    <div className="h-4 w-48 skeleton shimmer rounded-lg" />
                </div>

                <div className="card h-16 skeleton shimmer rounded-xl" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card h-32 skeleton shimmer rounded-xl" />
                    ))}
                </div>

                <div className="card overflow-hidden">
                    <div className="h-12 border-b border-gray-100 skeleton shimmer" />
                    <div className="space-y-4 p-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <div className="w-32 h-8 skeleton shimmer rounded" />
                                <div className="flex-1 h-8 skeleton shimmer rounded" />
                                <div className="w-48 h-8 skeleton shimmer rounded" />
                                <div className="w-32 h-8 skeleton shimmer rounded" />
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
            <div>
                <h1 className="text-3xl font-bold text-tea-800">Sales Tracking</h1>
                <p className="text-gray-600 mt-1">Monitor and analyze sales performance</p>
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
                            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                            <p className="text-2xl font-bold text-tea-800">
                                ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-brown-100 text-tea-700 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Products Sold</p>
                            <p className="text-2xl font-bold text-tea-800">{totalProducts}</p>
                        </div>
                        <div className="w-12 h-12 bg-tea-200 text-tea-700 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Transactions</p>
                            <p className="text-2xl font-bold text-tea-800">{totalTransactions}</p>
                        </div>
                        <div className="w-12 h-12 bg-brown-100 text-tea-700 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Avg Transaction</p>
                            <p className="text-2xl font-bold text-tea-800">
                                ${avgTransaction.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-tea-200 text-tea-700 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Table */}
            <div className="card overflow-hidden">
                <h3 className="text-lg font-semibold text-tea-800 mb-4 px-6 pt-6">Sales Details</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-tea-50">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date & Time</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stylist</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Products</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Amount</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Session ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map((sale) => (
                                <tr key={sale.id} className="border-b border-gray-100 hover:bg-tea-50 transition-colors">
                                    <td className="py-3 px-4 text-sm text-gray-700">
                                        {(sale.createdAt?.toDate() || new Date(sale.date)).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-brown-100 rounded-full flex items-center justify-center">
                                                <span className="text-tea-700 text-xs font-semibold">
                                                    {(sale.stylistName || 'U').split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{sale.stylistName || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-sm text-gray-700 font-medium">{sale.clientName || 'Walk-in'}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="space-y-1">
                                            {(sale.products || sale.items || []).map((product, idx) => (
                                                <div key={idx} className="text-sm text-gray-700">
                                                    {product.productName || product.name || 'Unknown Product'} <span className="text-gray-500">×{product.quantity || 1}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm text-gray-700">
                                        {(sale.products || sale.items || []).reduce((sum, p) => sum + (p.quantity || 1), 0)}
                                    </td>
                                    <td className="py-3 px-4 text-right text-sm font-semibold text-tea-700">
                                        ${(sale.totalAmount || sale.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-3 px-4 text-sm">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono">
                                            {sale.sessionId || 'N/A'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredSales.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-48 h-48 mb-6 opacity-80">
                            <ImageWithFallback src="/empty.png" alt="No sales" className="w-full h-full object-contain filter grayscale" />
                        </div>
                        <h3 className="text-xl font-bold text-tea-800 mb-2">No Sales Found</h3>
                        <p className="text-gray-600 max-w-sm mx-auto">
                            No transaction records match your current filters. Try adjusting the date range or stylist selection to view sales data.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sales;
