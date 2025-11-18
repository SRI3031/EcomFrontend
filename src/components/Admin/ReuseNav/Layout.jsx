import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Header from '../ReuseNav/Header';
import { Home, ShoppingCart, ClipboardList, Users, Box, MessageSquareText, Gift, Send } from 'lucide-react';

// --- Sidebar Component ---
const Sidebar = () => {
    const navLinks = [
        { name: 'Dashboard', path: 'dashboard', icon: Home },
        { name: 'Products', path: 'products', icon: ShoppingCart },
        { name: 'Orders', path: 'orders', icon: ClipboardList },
        { name: 'Users', path: 'users', icon: Users },
        { name: 'Reviews', path: 'reviews', icon: MessageSquareText },
        { name: 'Offers', path: 'offers', icon: Gift },
    ];

    return (
        // Sidebar styling remains consistent
        <aside className="w-64 bg-lime-900/90 backdrop-blur-md text-white min-h-screen p-6 shadow-2xl border-r border-gray-950 transition-all duration-300 ease-in-out">

            {/* Brand Logo and Title */}
            <div className="flex items-center gap-3 text-2xl font-extrabold text-lime-400 mb-12 tracking-wide border-b border-gray-700 pb-6">
                <Box className="h-8 w-8 text-shadow-blue-950 animate-pulse duration-1000" />
                🌱 GreenRemedy
            </div>

            {/* Navigation links container */}
            <nav className="space-y-3">
                {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end
                            className={({ isActive }) =>
                                `group flex items-center space-x-4 w-full p-3 rounded-lg transition-all duration-200 ease-in-out font-medium
                                ${isActive
                                    ? 'bg-lime-700/50 text-white shadow-xl transform translate-x-1 border-l-4 border-lime-400'
                                    : 'hover:bg-lime-800 hover:text-lime-200 border-l-4 border-transparent'}`
                            }
                        >
                            <Icon
                                className={`h-6 w-6 transition-colors duration-200 text-gray-300 group-hover:text-lime-400`}
                            />
                            <span className="text-lg">{link.name}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
};

// --- Layout Component ---
const Layout = ({ adminName }) => {
    const navigate = useNavigate();

    const handleSendOfferClick = () => {
        navigate('offers');
    };

    return (
        <div
            className="flex h-screen bg-cover bg-center bg-fixed text-gray-900 dark:text-gray-100 transition-colors duration-300"
            style={{
                backgroundImage: `url('https://images.pexels.com/photos/33559627/pexels-photo-33559627.jpeg?cs=srgb&dl=pexels-delot-33559627.jpg&fm=jpg')`,
            }}
        >
            {/* Sidebar */}
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-hidden">

                {/* **TOP BAR FIX:** This container now handles all the styling and layout for the header area. */}
                <div className="flex items-center gap-6 px-8 py-4 bg-lime-900/80 backdrop-blur-md shadow-xl z-10 border-b border-gray-800 transition-colors duration-300">
                    
                    {/* The Header component (now Search Bar and Profile) is placed here */}
                    {/* Note: The Header component is now expected to be flexible (w-full) from its own file. */}
                    <Header adminName={adminName} />
                    
                    {/* Send Offer Button - Placed strategically on the far right */}
                    {/* The ml-auto pushes the button as far right as possible from the Header component content */}
                    <button
                        onClick={handleSendOfferClick}
                        className="bg-lime-500 hover:bg-lime-600 text-white px-5 py-2.5 rounded-full font-bold shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] ring-2 ring-lime-400/50 whitespace-nowrap ml-auto"
                    >
                        <Send className="h-5 w-5" />
                        Send Bulk Offer
                    </button>
                    
                </div>

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto p-8 bg-white/5 dark:bg-black/5 backdrop-blur-md transition-colors duration-300 rounded-tl-3xl shadow-inner">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;