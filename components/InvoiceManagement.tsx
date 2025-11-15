import React, { useState, useEffect } from 'react';
import { Invoice, Product, InvoiceItem } from '../types';
import { parseInvoiceCommand } from '../services/geminiService';
import { PlusIcon, SparklesIcon, XIcon, MicrophoneIcon } from './icons';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface InvoiceManagementProps {
    invoices: Invoice[];
    products: Product[];
    addInvoice: (invoice: Omit<Invoice, 'id' | 'date' | 'total'>) => void;
    isAddModalOpen: boolean;
    setAddModalOpen: (isOpen: boolean) => void;
}

interface AddInvoiceModalProps {
    onClose: () => void;
    products: Product[];
    addInvoice: (invoice: Omit<Invoice, 'id' | 'date' | 'total'>) => void;
}

const AddInvoiceModal: React.FC<AddInvoiceModalProps> = ({ onClose, products, addInvoice }) => {
    const [command, setCommand] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [items, setItems] = useState<Omit<InvoiceItem, 'costPriceAtSale'>[]>([]);
    const [status, setStatus] = useState<'Paid' | 'Due'>('Due');
    const isOnline = useOnlineStatus();
    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        hasSupport,
    } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setCommand(prev => (prev ? prev + ' ' : '') + transcript);
        }
    }, [transcript]);


    const handleParseCommand = async () => {
        if (!command || !isOnline) return;
        setIsParsing(true);
        try {
            const parsedData = await parseInvoiceCommand(command, products);
            if (parsedData) {
                setCustomerName(parsedData.customerName);
                const invoiceItems = parsedData.items.map(item => {
                    const product = products.find(p => p.name === item.productName);
                    if (!product) return null;
                    return { productId: product.id, quantity: item.quantity, price: product.price };
                }).filter((i): i is Omit<InvoiceItem, 'costPriceAtSale'> => i !== null);
                setItems(invoiceItems);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsParsing(false);
        }
    };
    
    const handleAddItem = () => {
        if (products.length > 0) {
            setItems([...items, { productId: products[0].id, quantity: 1, price: products[0].price }]);
        }
    };

    const handleItemChange = (index: number, field: 'productId' | 'quantity', value: string) => {
        const newItems = [...items];
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            newItems[index] = { ...newItems[index], productId: value, price: product?.price || 0 };
        } else {
            newItems[index] = { ...newItems[index], quantity: parseInt(value) || 0 };
        }
        setItems(newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const itemsWithCost = items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return { ...item, costPriceAtSale: product?.costPrice || 0 };
        })
        addInvoice({ customerName, items: itemsWithCost, status });
        onClose();
    };
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
    }

    const total = items.reduce((acc, item) => {
        const product = products.find(p => p.id === item.productId);
        return acc + (product?.price || 0) * item.quantity;
    }, 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Invoice</h2>
                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className={`bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg mb-6 transition-opacity ${!isOnline ? 'opacity-50' : ''}`}>
                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                        <SparklesIcon className="w-5 h-5 inline-block mr-2" />
                        Generate with AI {!isOnline && <span className="text-xs font-semibold">(Offline)</span>}
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder={!isOnline ? "AI features require an internet connection" : "e.g., 'Invoice for John Doe: 2 Wireless Mouse, 1 4K Monitor'"}
                                value={command}
                                onChange={e => setCommand(e.target.value)}
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10"
                                disabled={!isOnline}
                            />
                             {hasSupport && isOnline && (
                                <button
                                    type="button"
                                    onClick={isListening ? stopListening : startListening}
                                    className={`absolute inset-y-0 right-0 flex items-center pr-3 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-blue-500'}`}
                                    title={isListening ? "Stop listening" : "Start voice command"}
                                >
                                    <MicrophoneIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <button onClick={handleParseCommand} disabled={isParsing || !isOnline} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isParsing ? 'Parsing...' : 'Generate'}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Name</label>
                        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm"/>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Items</label>
                        {items.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} className="w-1/2 block rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm">
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} min="1" className="w-1/4 block rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm"/>
                                <span className="w-1/4 text-right">{formatCurrency(((products.find(p=>p.id === item.productId)?.price || 0) * item.quantity))}</span>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddItem} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">+ Add Item</button>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value as 'Paid' | 'Due')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm">
                            <option>Due</option>
                            <option>Paid</option>
                        </select>
                    </div>
                    <div className="text-right font-bold text-xl dark:text-white">
                        Total: {formatCurrency(total)}
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Create Invoice</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InvoiceManagement: React.FC<InvoiceManagementProps> = ({ invoices, products, addInvoice, isAddModalOpen, setAddModalOpen }) => {
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">All Invoices</h2>
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
                            {invoices.map(invoice => (
                                <tr key={invoice.id} className="border-b dark:border-gray-700/50">
                                    <td className="py-3 px-3 font-mono text-sm">{invoice.id}</td>
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
                                    <td colSpan={5} className="text-center py-10 text-gray-500">No invoices yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isAddModalOpen && <AddInvoiceModal onClose={() => setAddModalOpen(false)} products={products} addInvoice={addInvoice} />}
        </div>
    );
};

export default InvoiceManagement;