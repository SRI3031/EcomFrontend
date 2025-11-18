// UserDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  User,
  Star,
  Heart,
  PackageCheck,
  Mail,
  LogOut,
  ShoppingCart,
} from "lucide-react";
import ProfileSection from "./ProfileSection.jsx";
import UserReviews from "./UserReviews.jsx";
import Wishlist from "./WishList.jsx";
import OrderHistorySection from "./OrderHistorySection.jsx";
import ContactUsPage from "./ContactAdminSection.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api.js";

const SHOP_URL = "/home";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch current logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!token) {
          setError("Not authenticated. Please log in.");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${API_BASE_URL}/${API_ENDPOINTS.PROFILE_ME}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUser(res.data); // axios parses JSON automatically
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || "Failed to fetch user data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Fetch wishlist & orders after user is loaded
  useEffect(() => {
    if (!user) return;
   
    const fetchWishlist = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/${API_ENDPOINTS.WISHLIST}`,
          { params: {email:user.email} }
        );
        setWishlist(res.data.items || []);
      } catch (err) {
        console.error(err);
        setWishlist([]);
      }
    };

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/${API_ENDPOINTS.USER_ORDER}`,
          { params: {email: user.email} }
        );
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
        setOrders([]);
      }
    };

    fetchOrders();
   fetchWishlist();
  }, [user]);

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSection user={user} onUpdateProfile={setUser} />;
      case "reviews":
        return <UserReviews />;
      case "wishlist":
        return <Wishlist  user={user}/>;
      case "orders":
        return <OrderHistorySection orders={orders} />;
      case "contact":
        return <ContactUsPage />;
      default:
        return null;
    }
  };

  if (loading)
    return <div className="text-center p-6 text-gray-700">Loading dashboard...</div>;
  if (error)
    return <div className="text-center p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md fixed h-full p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-700 mb-6">GreenRemedy 🌱</h1>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveSection("profile")}
              className={`flex items-center gap-2 w-full p-2 rounded hover:bg-green-50 ${
                activeSection === "profile" ? "bg-green-100" : ""
              }`}
            >
              <User className="w-5 h-5 text-green-600" /> Profile
            </button>
            <button
              onClick={() => setActiveSection("reviews")}
              className={`flex items-center gap-2 w-full p-2 rounded hover:bg-green-50 ${
                activeSection === "reviews" ? "bg-green-100" : ""
              }`}
            >
              <Star className="w-5 h-5 text-green-600" /> Reviews
            </button>
            <button
              onClick={() => setActiveSection("wishlist")}
              className={`flex items-center gap-2 w-full p-2 rounded hover:bg-green-50 ${
                activeSection === "wishlist" ? "bg-green-100" : ""
              }`}
            >
              <Heart className="w-5 h-5 text-green-600" /> Wishlist
            </button>
            <button
              onClick={() => setActiveSection("orders")}
              className={`flex items-center gap-2 w-full p-2 rounded hover:bg-green-50 ${
                activeSection === "orders" ? "bg-green-100" : ""
              }`}
            >
              <PackageCheck className="w-5 h-5 text-green-600" /> Orders
            </button>
            <button
              onClick={() => setActiveSection("contact")}
              className={`flex items-center gap-2 w-full p-2 rounded hover:bg-green-50 ${
                activeSection === "contact" ? "bg-green-100" : ""
              }`}
            >
              <Mail className="w-5 h-5 text-green-600" /> Contact Admin
            </button>

            <button
              onClick={() => navigate('/products',{state:{email:user.email}})}
              className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto p-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              <ShoppingCart className="w-5 h-5" /> Shop Now
            </button>
          </nav>
        </div>
        <button
          onClick={() => {
           navigate("/")
          }}
          className="flex items-center gap-2 w-full p-2 rounded hover:bg-red-50 text-red-600 font-medium"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        <header className="bg-white shadow-md h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-700">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h2>
          <p className="text-gray-600 font-medium">
            Logged in as: <span className="font-semibold">{user?.username || user?.email}</span>
          </p>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{renderSection()}</main>
      </div>
    </div>
  );
};

export default UserDashboard;
