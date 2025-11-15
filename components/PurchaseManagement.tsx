import React, { useState } from 'react';
import { Purchase, Product } from '../types';
import { XIcon } from './icons';

interface PurchaseManagementProps {
    purchases: Purchase[];
    products: Product[];
    addPurchase: (purchase: Omit<Purchase, 'id' | 'date' | 'totalCost' | 'productName'>) => void;
    isAddModalOpen: boolean;
    setAddModalOpen: (isOpen: boolean) => void;
}

const AddPurchaseModal: React.FC<{
    onClose: () => void;
    products: Product[];
    addPurchase: (purchase: Omit<Purchase, 'id' | 'date' | 'totalCost' | 'productName'>) => void;
}> = ({ onClose, products, addPurchase }) => {
    const [productId, setProductId] = useState(products.length > 0 ? products[0].id : '');
    const [quantity, setQuantity] = useState('');
    const [unitCost, setUnitCost] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId || !quantity || !unitCost) {
            alert("Please fill out all fields.");
            return;
        }
        addPurchase({
            productId,
            quantity: parseInt(quantity, 10),
            unitCost: parseFloat(unitCost),
        });
        onClose();
    };
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
    }
    
    const totalCost = (parseInt(quantity, 10) || 0) * (parseFloat(unitCost) || 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Record Purchase</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product</label>
                        <select value={productId} onChange={e => setProductId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                             {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required min="1" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit Cost (₹)</label>
                            <input type="number" value={unitCost} onChange={e => setUnitCost(e.target.value)} required min="0" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm"/>
                        </div>
                    </div>
                    <div className="text-right font-bold text-xl dark:text-white">
                        Total Cost: {formatCurrency(totalCost)}
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Record Purchase</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const PurchaseManagement: React.FC<PurchaseManagementProps> = ({ purchases, products, addPurchase, isAddModalOpen, setAddModalOpen }) => {
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
    }
    
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">All Purchases</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b dark:border-gray-700">
                            <tr>
                                <th className="py-2 px-3">Date</th>
                                <th className="py-2 px-3">Product</th>
                                <th className="py-2 px-3">Quantity</th>
                                <th className="py-2 px-3">Unit Cost</th>
                                <th className="py-2 px-3">Total Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map(purchase => (
                                <tr key={purchase.id} className="border-b dark:border-gray-700/50">
                                    <td className="py-3 px-3">{purchase.date}</td>
                                    <td className="py-3 px-3">{purchase.productName}</td>
                                    <td className="py-3 px-3">{purchase.quantity}</td>
                                    <td className="py-3 px-3">{formatCurrency(purchase.unitCost)}</td>
                                    <td className="py-3 px-3 font-medium">{formatCurrency(purchase.totalCost)}</td>
                                </tr>
                            ))}
                            {purchases.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">No purchases recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isAddModalOpen && <AddPurchaseModal onClose={() => setAddModalOpen(false)} products={products} addPurchase={addPurchase} />}
        </div>
    );
};

export default PurchaseManagement;
