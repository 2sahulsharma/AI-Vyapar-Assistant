import React, { useState, useCallback } from 'react';
import { Product, Invoice, Purchase } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import InvoiceManagement from './components/InvoiceManagement';
import PurchaseManagement from './components/PurchaseManagement';
import useLocalStorage from './hooks/useLocalStorage';

type View = 'dashboard' | 'products' | 'invoices' | 'purchases';

const App: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');
    const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
    const [isAddInvoiceModalOpen, setAddInvoiceModalOpen] = useState(false);
    const [isAddPurchaseModalOpen, setAddPurchaseModalOpen] = useState(false);
    
    const [products, setProducts] = useLocalStorage<Product[]>('products', [
        { id: 'p1', name: 'Wireless Mouse', price: 2500, costPrice: 1800, stock: 150, imageUrl: 'https://picsum.photos/seed/mouse/200' },
        { id: 'p2', name: 'Mechanical Keyboard', price: 8000, costPrice: 6000, stock: 80, imageUrl: 'https://picsum.photos/seed/keyboard/200' },
        { id: 'p3', name: '4K Monitor', price: 35000, costPrice: 28000, stock: 50, imageUrl: 'https://picsum.photos/seed/monitor/200' },
        { id: 'p4', name: 'USB-C Hub', price: 4500, costPrice: 3000, stock: 200, imageUrl: 'https://picsum.photos/seed/hub/200' },
    ]);
    const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);
    const [purchases, setPurchases] = useLocalStorage<Purchase[]>('purchases', []);

    const addProduct = useCallback((product: Omit<Product, 'id'>) => {
        setProducts(prev => [...prev, { ...product, id: `p${Date.now()}` }]);
    }, [setProducts]);

    const updateProduct = useCallback((updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    }, [setProducts]);

    const addInvoice = useCallback((invoice: Omit<Invoice, 'id' | 'date' | 'total'>) => {
        const newItems = invoice.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) throw new Error("Product not found");
            return { ...item, price: product.price, costPriceAtSale: product.costPrice };
        });

        const total = newItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

        setProducts(prevProducts => prevProducts.map(p => {
            const itemInInvoice = newItems.find(item => item.productId === p.id);
            if (itemInInvoice) {
                return { ...p, stock: p.stock - itemInInvoice.quantity };
            }
            return p;
        }));

        const newInvoice: Invoice = {
            ...invoice,
            id: `inv${Date.now()}`,
            items: newItems,
            total,
            date: new Date().toISOString().split('T')[0],
        };
        setInvoices(prev => [newInvoice, ...prev]);
    }, [products, setProducts, setInvoices]);

    const addPurchase = useCallback((purchase: Omit<Purchase, 'id' | 'date' | 'totalCost' | 'productName'>) => {
        const product = products.find(p => p.id === purchase.productId);
        if (!product) throw new Error("Product not found for purchase");

        // Add to purchases list
        const newPurchase: Purchase = {
            ...purchase,
            id: `pur${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            totalCost: purchase.unitCost * purchase.quantity,
            productName: product.name,
        };
        setPurchases(prev => [newPurchase, ...prev]);

        // Update product stock
        setProducts(prevProducts => prevProducts.map(p => 
            p.id === purchase.productId 
                ? { ...p, stock: p.stock + purchase.quantity } 
                : p
        ));
    }, [products, setProducts, setPurchases]);
    
    const renderView = () => {
        switch (view) {
            case 'products':
                return <ProductManagement 
                            products={products} 
                            addProduct={addProduct} 
                            updateProduct={updateProduct} 
                            isAddModalOpen={isAddProductModalOpen}
                            setAddModalOpen={setAddProductModalOpen}
                        />;
            case 'invoices':
                return <InvoiceManagement 
                            invoices={invoices} 
                            products={products} 
                            addInvoice={addInvoice}
                            isAddModalOpen={isAddInvoiceModalOpen}
                            setAddModalOpen={setAddInvoiceModalOpen}
                        />;
            case 'purchases':
                return <PurchaseManagement
                            purchases={purchases}
                            products={products}
                            addPurchase={addPurchase}
                            isAddModalOpen={isAddPurchaseModalOpen}
                            setAddModalOpen={setAddPurchaseModalOpen}
                        />;
            case 'dashboard':
            default:
                return <Dashboard products={products} invoices={invoices} purchases={purchases} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <Sidebar currentView={view} setView={setView} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    currentView={view}
                    onAddProductClick={() => setAddProductModalOpen(true)}
                    onCreateInvoiceClick={() => setAddInvoiceModalOpen(true)}
                    onRecordPurchaseClick={() => setAddPurchaseModalOpen(true)}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

export default App;
