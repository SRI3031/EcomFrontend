// src/components/Admin/OrderStatus.jsx
import { useLocation } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import Table from '../ReuseNav/Table';
import Modal from '../ReuseNav/Modal';
import OrderDetails from '../ReuseNav/OrderDetails';
// Importing professional icons from Lucide React
import { Eye, XCircle, RefreshCcw } from 'lucide-react';
// Importing Toastify for non-intrusive notifications
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
// Import API_BASE_URL
import { API_BASE_URL,API_ENDPOINTS } from '@/config/api'; 

const OrderStatus = () => {
  const [userOrders, setUserOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [pendingStatusUpdates, setPendingStatusUpdates] = useState({});
  //  Highlighted row
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const location = useLocation();
  //  Auto-remove highlight after 2 seconds (like Products.jsx)
  useEffect(() => {
    const idFromSearch = localStorage.getItem("highlightId");
    if (idFromSearch) {
      setSelectedOrderId(idFromSearch);

      const timer = setTimeout(() => {
        setSelectedOrderId(null);
        localStorage.removeItem("highlightId");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [location]);

  // 🔹 Scroll highlighted row into view
  useEffect(() => {
    if (selectedOrderId) {
      const rowEl = document.getElementById(`row-${selectedOrderId}`);
      if (rowEl) rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedOrderId]);
//fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/${API_ENDPOINTS.ORDER_DETAILS}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        if (typeof res.data === 'string' && res.data.startsWith('<!doctype html>')) {
          throw new Error("Received HTML instead of JSON. Check API server and URL.");
        }

        const orders = Array.isArray(res.data) ? res.data : res.data.orders;
        if (!Array.isArray(orders)) {
          toast.error("Error loading orders: Unexpected data format from server.");
          setIsLoading(false);
          return;
        }

        setUserOrders(orders.map(o => ({
          id: o._id,
          user: o.user?.username || 'N/A',

          amount: `${o.cartTotal}`,
          status: o.orderStatus,
          products: o.products,
            payment: o.payment,
  transactionId: o.transactionId,
          createdAt: o.createdAt
        })));
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err.message);
        toast.error("Failed to load orders from server.");
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleStatusChange = (orderId, newStatus) => {
    setPendingStatusUpdates(prev => ({
      ...prev,
      [orderId]: newStatus
    }));
  };

  const handleUpdateStatus = async (order) => {
    const newStatus = pendingStatusUpdates[order.id];
    if (!newStatus || newStatus === order.status) {
      toast.info("No status change to update.");
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/${API_ENDPOINTS.ORDER_STATUS}/${order.id}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setUserOrders(userOrders.map(o =>
        o.id === order.id ? { ...o, status: newStatus } : o
      ));

      toast.success(`Order '${order.id}' updated to ${newStatus}.`);
      setPendingStatusUpdates(prev => {
        const copy = { ...prev };
        delete copy[order.id];
        return copy;
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleOpenCancelModal = (order) => {
    setOrderToCancel(order);
    setIsCancelModalOpen(true);
  };

  const confirmCancelOrder = async () => {
    try {
      await axios.put(`${API_BASE_URL}/${API_ENDPOINTS.ORDER_STATUS}/${orderToCancel.id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setUserOrders(userOrders.map(o =>
        o.id === orderToCancel.id ? { ...o, status: 'Cancelled' } : o
      ));
      toast.success(`Order '${orderToCancel.id}' cancelled.`);
      setIsCancelModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel order');
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
    setOrderToCancel(null);
  };

  const columns = [
    { header: 'Order ID', accessor: 'id' },
    { header: 'Customer', accessor: 'user' },
    { header: 'Amount', accessor: 'amount' },
    { header: 'Status', accessor: 'status' },
    {
      header: 'Payment', 
    accessor: 'payment', 
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.payment?.method || '-'}</span>
        <span className={`text-sm ${
          row.payment?.status === 'Completed' ? 'text-green-500' :
          row.payment?.status === 'Pending' ? 'text-yellow-500' :
          'text-red-500'
        }`}>
          {row.payment?.status || '-'}
        </span>
        {row.transactionId && <span className="text-xs text-gray-500">TXN: {row.transactionId}</span>}
      </div>
    )
  },
  ];

  const actions = (row) => (
    <div className="flex space-x-2 justify-end">
      <button
        onClick={() => handleViewDetails(row)}
        className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-800 transition-colors duration-200"
        title="View Details"
      >
        <Eye className="h-5 w-5" />
      </button>
      {row.status !== 'Cancelled' && (
        <button
          onClick={() => handleOpenCancelModal(row)}
          className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-800 transition-colors duration-200"
          title="Cancel Order"
        >
          <XCircle className="h-5 w-5" />
        </button>
      )}
      {row.status !== 'Shipped' && row.status !== 'Delivered' && row.status !== 'Cancelled' && (
        <button
          onClick={() => handleUpdateStatus(row)}
          className="p-2 rounded-full text-gray-400 hover:text-indigo-500 hover:bg-gray-800 transition-colors duration-200"
          title="Update Status"
        >
          <RefreshCcw className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8 p-8 rounded-xl shadow-lg backdrop-blur-sm min-h-screen">
      <h1 className="text-3xl font-bold text-gray-100">User Order Management</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-4 text-white">
            <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg font-medium text-white">Loading User Orders...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-300 mb-4">All User Orders</h2>
            <Table 
            columns={columns} 
            data={userOrders} 
            actions={actions}
            selectedId={selectedOrderId}
            onRowClick={(id) => setSelectedOrderId(id)} // update on click
            />
          </div>
        </div>
      )}

      <Modal isOpen={isDetailsModalOpen} onClose={handleCloseDetailsModal}>
        <OrderDetails
          order={selectedOrder}
          onClose={handleCloseDetailsModal}
          onStatusChange={handleStatusChange}
        />
      </Modal>

      <Modal isOpen={isCancelModalOpen} onClose={handleCloseCancelModal}>
        <div className="text-center p-8 bg-blue-50 rounded-xl">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Confirm Cancellation</h3>
          <p className="text-gray-800">
            Are you sure you want to cancel order <span className="font-semibold"> {orderToCancel?.id}</span>?
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <button
              onClick={confirmCancelOrder}
              className="px-6 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition-colors duration-200"
            >
              Yes, Cancel
            </button>
            <button
              onClick={handleCloseCancelModal}
              className="px-6 py-2 rounded-md bg-gray-700 text-gray-100 font-medium hover:bg-gray-600 transition-colors duration-200"
            >
              No, Keep It
            </button>
          </div>
        </div>
      </Modal>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
};

export default OrderStatus;  