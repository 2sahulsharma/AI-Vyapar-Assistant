import React, { useState, useMemo } from 'react';
import { Product, Invoice, Purchase } from '../types';
import { InvoicesIcon, ShoppingCartIcon, CurrencyRupeeIcon } from './icons';

interface DashboardProps {
    products: Product[];
    invoices: Invoice[];
    purchases: Purchase[];
}

type TimeRange = 'today' | 'week' | 'month' | 'year' | 'all';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ products, invoices, purchases }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('all');

    const dateFilteredData = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const inRange = (dateStr: string) => {
            if (timeRange === 'all') return true;
            const date = new Date(dateStr);
            switch (timeRange) {
                case 'today':
                    return date >= today;
                case 'week':
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    return date >= weekStart;
                case 'month':
                    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                    return date >= monthStart;
                case 'year':
                    const yearStart = new Date(today.getFullYear(), 0, 1);
                    return date >= yearStart;
                default:
                    return true;
            }
        };

        const filteredInvoices = invoices.filter(inv => inRange(inv.date));
        const filteredPurchases = purchases.filter(pur => inRange(pur.date));

        return { filteredInvoices, filteredPurchases };
    }, [invoices, purchases, timeRange]);

    const { filteredInvoices, filteredPurchases } = dateFilteredData;

    const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPurchaseCost = filteredPurchases.reduce((sum, pur) => sum + pur.totalCost, 0);
    
    const costOfGoodsSold = filteredInvoices.reduce((sum, inv) => {
        const invoiceCost = inv.items.reduce((itemSum, item) => itemSum + (item.costPriceAtSale * item.quantity), 0);
        return sum + invoiceCost;
    }, 0);

    const grossProfit = totalSales - costOfGoodsSold;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
    }

    const timeRangeOptions: { id: TimeRange, label: string }[] = [
        { id: 'today', label: 'Today' },
        { id: 'week', label: 'This Week' },
        { id: 'month', label: 'This Month' },
        { id: 'year', label: 'This Year' },
        { id: 'all', label: 'All Time' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <div className="flex justify-start items-center bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md max-w-max">
                    {timeRangeOptions.map(option => (
                        <button 
                            key={option.id}
                            onClick={() => setTimeRange(option.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${timeRange === option.id ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Sales" 
                    value={formatCurrency(totalSales)}
                    icon={<InvoicesIcon className="h-6 w-6 text-blue-500" />}
                />
                <StatCard 
                    title="Total Purchases" 
                    value={formatCurrency(totalPurchaseCost)}
                    icon={<ShoppingCartIcon className="h-6 w-6 text-blue-500" />}
                />
                <StatCard 
                    title="Gross Profit" 
                    value={formatCurrency(grossProfit)}
                    icon={<CurrencyRupeeIcon className="h-6 w-6 text-blue-500" />}
                />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Invoices</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b dark:border-gray-700">
                            <tr>
                                <th className="py-2 px-3">Invoice ID</th>
                                <th className="py-2 px-3">Customer</th>
                                <th className="py-2 px-3">Date</th>
                                <th className="py-2 px-3">Amount</th>
                                <th className="py-2 px-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.slice(0, 5).map(invoice => (
                                <tr key={invoice.id} className="border-b dark:border-gray-700/50">
                                    <td className="py-3 px-3">{invoice.id}</td>
                                    <td className="py-3 px-3">{invoice.customerName}</td>
                                    <td className="py-3 px-3">{invoice.date}</td>
                                    <td className="py-3 px-3 font-medium">{formatCurrency(invoice.total)}</td>
                                    <td className="py-3 px-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            invoice.status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                        }`}>{invoice.status}</span>
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">No invoices yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
