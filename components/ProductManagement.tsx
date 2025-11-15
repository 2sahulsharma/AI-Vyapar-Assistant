import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { findProductByImage } from '../services/geminiService';
import { CameraIcon, SparklesIcon, XIcon, EditIcon, TrashIcon, MicrophoneIcon } from './icons';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ProductManagementProps {
    products: Product[];
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (product: Product) => void;
    isAddModalOpen: boolean;
    setAddModalOpen: (isOpen: boolean) => void;
}

const AddProductModal: React.FC<{ onClose: () => void; addProduct: (product: Omit<Product, 'id'>) => void; }> = ({ onClose, addProduct }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [stock, setStock] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addProduct({ name, price: parseFloat(price), costPrice: parseFloat(costPrice), stock: parseInt(stock), imageUrl: `https://picsum.photos/seed/${name.replace(/\s/g, '-')}/${200}` });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Product</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost Price (₹)</label>
                            <input type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} required min="0" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Selling Price (₹)</label>
                            <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock Quantity</label>
                        <input type="number" value={stock} onChange={e => setStock(e.target.value)} required min="0" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                    </div>
                    <div className="flex justify-end pt-4">
                         <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Add Product</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditProductModal: React.FC<{
    onClose: () => void;
    product: Product;
    updateProduct: (product: Product) => void;
}> = ({ onClose, product, updateProduct }) => {
    const [name, setName] = useState(product.name);
    const [price, setPrice] = useState(String(product.price));
    const [costPrice, setCostPrice] = useState(String(product.costPrice));
    const [stock, setStock] = useState(String(product.stock));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProduct({
            ...product,
            name,
            price: parseFloat(price),
            costPrice: parseFloat(costPrice),
            stock: parseInt(stock),
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Product</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost Price (₹)</label>
                            <input type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} required min="0" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Selling Price (₹)</label>
                            <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock Quantity</label>
                        <input type="number" value={stock} onChange={e => setStock(e.target.value)} required min="0" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                    </div>
                    <div className="flex justify-end pt-4">
                         <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ImageSearchModal: React.FC<{ onClose: () => void; products: Product[]; setSearchResult: (product: Product | null) => void; }> = ({ onClose, products, setSearchResult }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setError(null);
        setSearchResult(null);
        try {
            const result = await findProductByImage(imageFile, products);
            setSearchResult(result);
            onClose();
        } catch (err) {
            setError("Failed to search by image. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center"><SparklesIcon className="w-6 h-6 mr-2 text-blue-500"/> AI Image Search</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                 <div>
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-blue-300 dark:hover:file:bg-gray-600"/>
                    {imageFile && <img src={URL.createObjectURL(imageFile)} alt="Preview" className="mt-4 rounded-lg max-h-48 mx-auto" />}
                </div>
                 <div className="mt-6 flex justify-end">
                     <button onClick={handleSearch} disabled={!imageFile || isLoading} className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                 </div>
                 {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            </div>
        </div>
    );
};


const ProductManagement: React.FC<ProductManagementProps> = ({ products, addProduct, updateProduct, isAddModalOpen, setAddModalOpen }) => {
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isImageSearchOpen, setImageSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [imageSearchResult, setImageSearchResult] = useState<Product | null>(null);
    const isOnline = useOnlineStatus();

    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        hasSupport
    } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setSearchQuery(transcript);
            setImageSearchResult(null);
        }
    }, [transcript]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
    }

    const filteredProducts = products.filter(product => {
        const query = searchQuery.toLowerCase();
        if (query === '' && !imageSearchResult) return true;
        if (imageSearchResult) return product.id === imageSearchResult.id;
        return product.name.toLowerCase().includes(query)
    });

    const closeImageSearch = () => {
        setImageSearchOpen(false);
    }
    
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                     <div className="relative w-full md:max-w-md">
                        <input 
                            type="text" 
                            placeholder="Search products by name or voice..." 
                            value={searchQuery} 
                            onChange={e => { setSearchQuery(e.target.value); setImageSearchResult(null); }} 
                            className="w-full pl-4 pr-10 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {hasSupport && isOnline && (
                             <button
                                type="button"
                                onClick={isListening ? stopListening : startListening}
                                className={`absolute inset-y-0 right-0 flex items-center pr-3 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-blue-500'}`}
                                title={isListening ? "Stop listening" : "Search by voice"}
                            >
                                <MicrophoneIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setImageSearchOpen(true)} 
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg shadow-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!isOnline}
                            title={!isOnline ? "AI features require an internet connection" : "Search for a product using an image"}
                        >
                            <CameraIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Search by Image</span>
                        </button>
                    </div>
                </div>
            </div>

            {imageSearchResult && (
                 <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg flex justify-between items-center">
                    <p className="text-blue-800 dark:text-blue-200">
                        <span className="font-semibold">AI Search Result:</span> "{imageSearchResult.name}"
                    </p>
                    <button onClick={() => setImageSearchResult(null)} className="text-blue-600 dark:text-blue-300 hover:underline">Clear</button>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Product</th>
                                <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Cost Price</th>
                                <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Sell Price</th>
                                <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                                <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full object-cover" src={product.imageUrl} alt={product.name} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrency(product.costPrice)}</td>
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrency(product.price)}</td>
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.stock}</td>
                                    <td className="py-3 px-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => setEditingProduct(product)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                            <EditIcon className="w-5 h-5"/>
                                        </button>
                                        {/* Placeholder for delete functionality */}
                                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ml-4" onClick={() => alert('Delete functionality not implemented yet.')}>
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {filteredProducts.length === 0 && <p className="text-center text-gray-500 py-10">No products found.</p>}

            {isAddModalOpen && <AddProductModal onClose={() => setAddModalOpen(false)} addProduct={addProduct} />}
            {editingProduct && <EditProductModal onClose={() => setEditingProduct(null)} product={editingProduct} updateProduct={updateProduct} />}
            {isImageSearchOpen && <ImageSearchModal onClose={closeImageSearch} products={products} setSearchResult={setImageSearchResult} />}
        </div>
    );
};

export default ProductManagement;