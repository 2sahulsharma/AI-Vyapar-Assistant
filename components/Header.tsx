import React from 'react';
import { PlusIcon } from './icons';

interface HeaderProps {
    currentView: string;
    onAddProductClick: () => void;
    onCreateInvoiceClick: () => void;
    onRecordPurchaseClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onAddProductClick, onCreateInvoiceClick, onRecordPurchaseClick }) => {
    
    const renderActions = () => {
        switch (currentView) {
            case 'products':
                return (
                    <button onClick={onAddProductClick} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                        <PlusIcon className="w-5 h-5" />
                        <span>Add Product</span>
                    </button>
                );
            case 'invoices':
                return (
                     <button onClick={onCreateInvoiceClick} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                        <PlusIcon className="w-5 h-5" />
                        <span>Create Invoice</span>
                    </button>
                );
            case 'purchases':
                return (
                     <button onClick={onRecordPurchaseClick} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                        <PlusIcon className="w-5 h-5" />
                        <span>Record Purchase</span>
                    </button>
                );
            default:
                return null;
        }
    }

    return (
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex-shrink-0">
            <h1 className="text-xl font-semibold capitalize text-gray-800 dark:text-white">{currentView}</h1>
            <div>
                {renderActions()}
            </div>
        </header>
    );
};

export default Header;
