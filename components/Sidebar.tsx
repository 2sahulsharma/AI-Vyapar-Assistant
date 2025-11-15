import React from 'react';
import { DashboardIcon, ProductsIcon, InvoicesIcon, SparklesIcon, ShoppingCartIcon } from './icons';

type View = 'dashboard' | 'products' | 'invoices' | 'purchases';

interface SidebarProps {
    currentView: View;
    setView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
    const navItems = [
        { id: 'dashboard', icon: DashboardIcon, label: 'Dashboard' },
        { id: 'products', icon: ProductsIcon, label: 'Products' },
        { id: 'invoices', icon: InvoicesIcon, label: 'Invoices' },
        { id: 'purchases', icon: ShoppingCartIcon, label: 'Purchases' },
    ];

    return (
        <div className="flex flex-col w-16 md:w-64 bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex items-center justify-center md:justify-start md:pl-6 h-16 border-b dark:border-gray-700">
                <SparklesIcon className="h-8 w-8 text-blue-500" />
                <span className="hidden md:block ml-3 text-lg font-bold text-gray-800 dark:text-white">AI Vyapar</span>
            </div>
            <nav className="flex-1 mt-6">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id as View)}
                        className={`flex items-center justify-center md:justify-start w-full py-4 px-6 my-1 transition-colors duration-200 ${
                            currentView === item.id
                                ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400 border-r-4 border-blue-500'
                                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                    >
                        <item.icon className="h-6 w-6" />
                        <span className="hidden md:block ml-4 text-md font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
