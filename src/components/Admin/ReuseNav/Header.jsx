import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { ChevronDown, Bell, Settings, Search, X } from 'lucide-react';

// Reusing the Modal and UserProfile components from your existing code
import Modal from './Modal.jsx';
import UserProfile from './UserProfile.jsx';
// NOTE: Assuming your API config path is correct
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api.js' 

// Debounce function to limit API calls while typing
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

/**
 * Renders the search results dropdown/overlay.
 */
const SearchResults = ({ results, isLoading, query, navigate }) => {
    if (isLoading) {
        return <div className="p-4 text-center text-gray-400">Searching...</div>;
    }

    if (!query || query.length < 2) {
        return <div className="p-4 text-center text-gray-400">Type at least 2 characters to search.</div>;
    }

    // Only check for admin resource results (users, products, orders).
    const hasAdminResults = results.users.length > 0 || results.products.length > 0 || results.orders.length > 0;

    if (!hasAdminResults) {
        return <div className="p-4 text-center text-gray-400">No admin items found for "{query}".</div>;
    }

    const ResultGroup = ({ title, data, renderItem }) => (
        data.length > 0 && (
            <div className="mb-4">
                <h3 className="text-xs font-semibold uppercase text-violet-400 mb-2 border-b border-gray-700 pb-1">{title} ({data.length})</h3>
                <ul className="space-y-1">
                    {data.slice(0, 5).map(renderItem)} {/* Limit to 5 results per group */}
                    {data.length > 5 && <li className="text-xs text-gray-500 pt-1">...and {data.length - 5} more</li>}
                </ul>
            </div>
        )
    );

    const formatLink = (link, type) => {
        let label = "Open";
        let redirectPath = "/";

        if (type === "product") {
            label = "View Product";
            redirectPath = `/${API_ENDPOINTS.ADD_PRODUCTS}`
        } else if (type === "order") {
            label = "View Order";
            redirectPath = `/${API_ENDPOINTS.ORDER_SEARCH}`
        } else if (type === "user") {
            label = "View Profile";
            redirectPath = `/${API_ENDPOINTS.USER_DETAILS}`
        }

        return (
            <button
                onClick={() => {
                    // Logic ONLY for admin resources (User, Product, Order)
                    const id = link.split("/").pop();

                    // Set the ID so the target list page can pick it up and scroll/flash the item.
                    localStorage.setItem("highlightId", id);

                    navigate(redirectPath);
                }}
                className="block text-xs font-medium text-violet-400 hover:text-violet-300 hover:underline transition"
            >
                {label}
            </button>
        );
    };

    return (
        <div className="p-4 max-h-96 overflow-y-auto">
            {/* Renders Users/Admins - Applies highlight logic */}
            <ResultGroup
                title="Users/Admins"
                data={results.users}
                renderItem={(item) => (
                    <li key={item._id} className="flex justify-between items-center">
                        <span className="text-white text-sm truncate">{item.username} ({item.role})</span>
                        {formatLink(item.link,"user")}
                    </li>
                )}
            />

            {/* Renders Products - Applies highlight logic */}
            <ResultGroup
                title="Products"
                data={results.products}
                renderItem={(item) => (
                    <li key={item._id} className="flex justify-between items-center">
                        <span className="text-white text-sm truncate">{item.name} ({"\u20B9"}{item.price})</span>
                        {formatLink(item.link,"product")}
                    </li>
                )}
            />

            {/* Renders Orders - Applies highlight logic */}
            <ResultGroup
                title="Orders"
                data={results.orders}
                renderItem={(item) => (
                    <li key={item._id} className="flex justify-between items-center">
                        <span className="text-white text-sm truncate">Order {item._id.slice(-6)} - {item.customerName}</span>
                        {formatLink(item.link,"order")}
                    </li>
                )}
            />

        </div>
    );
};


/**
 * Renders the main header content for the admin dashboard.
 * NOTE: All top-level styling (background, padding, shadow) has been removed 
 * and is now handled by the Layout component.
 */
const Header = ({ adminName: propAdminName }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Global Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState({ users: [], products: [], orders: [], pages: [] });
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce

    const [adminProfile, setAdminProfile] = useState(null);
    const menuRef = useRef(null);
    const searchRef = useRef(null);

    // Initial Profile Fetch
    useEffect(() => {
        const fetchAdminProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    console.warn("No token found in localStorage");
                    return;
                }

                const response = await axios.get(
                    `${API_BASE_URL}/${API_ENDPOINTS.ADMIN_PROFILE}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setAdminProfile(response.data);
            } catch (error) {
                if (error.response?.status === 401) {
                    console.error("Unauthorized: Invalid or expired token");
                } else {
                    console.error("Error fetching admin profile:", error.message);
                }
            }
        };

        fetchAdminProfile();

        const handleClickOutside = (event) => {
            // Close Profile Menu
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
            // Close Search Results
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                // If search term is active, just hide the results
                if (searchTerm.length > 0) {
                    setSearchResults({ users: [], products: [], orders: [], pages: [] });
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchTerm]);

    // Global Search Effect
    const fetchSearchResults = useCallback(async (query) => {
        if (!query || query.length < 2) {
            setSearchResults({ users: [], products: [], orders: [], pages: [] });
            setIsSearching(false);
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) return;

        setIsSearching(true);
        try {
            const response = await axios.get(
                `${API_BASE_URL}/${API_ENDPOINTS.ADMIN_SEARCH}?q=${query}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setSearchResults(response.data);
        } catch (error) {
            console.error("Error fetching search results:", error);
            setSearchResults({ users: [], products: [], orders: [], pages: [] });
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        fetchSearchResults(debouncedSearchTerm);
    }, [debouncedSearchTerm, fetchSearchResults]);

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleOpenProfileModal = () => {
        setIsMenuOpen(false); // close dropdown first
        setTimeout(() => {
            setIsProfileModalOpen(true); // open modal after dropdown closes
        }, 100); // short delay to prevent click conflict
    };

    const handleCloseProfileModal = () => {
        setIsProfileModalOpen(false); // Close the profile modal
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSearchResults({ users: [], products: [], orders: [], pages: [] });
    };

    const currentAdminName = propAdminName || adminProfile?.username || localStorage.getItem("loggedUser") || 'Admin';

    // Renders the Search Bar and the Profile Section, to be placed inside Layout.jsx
    return (
        <div className="flex items-center justify-between w-full"> 
            {/* Left Side: Search Bar */}
            <div className="relative w-1/3 min-w-[200px] max-w-lg" ref={searchRef}>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-900/70" />
                </div>
                <input
                    type="text"
                    placeholder="Search anything..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 rounded-lg bg-white/90 text-gray-900 border border-transparent focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all duration-200"
                />
                {searchTerm && (
                    <button
                        onClick={handleClearSearch}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                {/* Search Results Dropdown/Overlay */}
                {(searchTerm.length >= 2 || isSearching) && (
                        <div className="absolute left-0 mt-3 w-full max-w-lg bg-gray-800 rounded-md shadow-2xl overflow-hidden ring-1 ring-black ring-opacity-5 z-50">
                        <SearchResults
                            results={searchResults}
                            isLoading={isSearching}
                            query={searchTerm}
                            navigate={navigate}
                        />
                    </div>
                )}
            </div>

            {/* Right Side: Professional Profile & Quick Actions */}
            <div className="flex items-center space-x-4">

                {/* User Profile Section with Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={handleMenuToggle}
                        type="button"
                        className="flex items-center space-x-2 py-2 px-4 bg-lime-700 rounded-full transition-colors duration-200 hover:bg-lime-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
                        aria-label="User Profile Menu"
                        aria-expanded={isMenuOpen}
                    >
                        <div className="h-8 py-1 px-3 bg-lime-400 rounded-full flex items-center justify-center text-sm font-semibold text-lime-900">
                            {currentAdminName}
                        </div>
                        <ChevronDown className={`h-5 w-5 text-gray-200 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* The dropdown menu, conditionally rendered */}
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-3 w-48 bg-gray-800 rounded-md shadow-lg overflow-hidden ring-1 ring-black ring-opacity-5">
                            <div className="py-1">
                                <a
                                    onClick={handleOpenProfileModal}
                                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                                >
                                    Profile
                                </a>

                                <div className="border-t border-gray-700 my-1"></div>
                                <a href="/" className="block px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors duration-200">
                                    Log out
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* The Profile Modal */}
            {adminProfile && (
                <Modal isOpen={isProfileModalOpen} onClose={handleCloseProfileModal}>
                    <UserProfile user={adminProfile} onClose={handleCloseProfileModal} />
                </Modal>
            )}
        </div>
    );
};

export default Header;