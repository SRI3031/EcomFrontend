// src/components/Admin/forms/OrderDetails.jsx

import React, { useState, useEffect } from 'react';
// Importing professional icons from Lucide React
import { Check, X } from 'lucide-react';

/**
 * Renders a form to view and update an order's details.
 * This component is designed to be used within a modal.
 *
 * @param {object} order - The order object containing details like id, user, amount, and status.
 * @param {function} onClose - A callback function to close the modal.
 */
const OrderDetails = ({ order, onClose,onStatusChange }) => {
    const [status, setStatus] = useState(order?.status || 'Pending');

    const statuses = [
        'Pending',
        'Processing',
        'Out for Delivery',
        'Delivered',
        'Cancelled'
    ];

    // Update local state if the order prop changes (e.g., when a new order is selected)
    useEffect(() => {
        if (order) {
            setStatus(order.status);
        }
    }, [order]);

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

const handleSubmit = (e) => {
  e.preventDefault();
  if (status && status !== order.status) {
    onStatusChange(order.id, status); // Pass updated status to parent
  }
  onClose();
};


    if (!order) {
        return <p>Select an order to view details.</p>;
    }

    return (
        // The main form container with modern styling to fit within the modal
        <form onSubmit={handleSubmit} className="space-y-6 text-left p-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Order Details
            </h3>

            {/* Static Order Information */}
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-gray-100">
                <p className="text-lg"><span className="font-semibold text-gray-700">Order ID:</span> {order.id}</p>
                <p className="text-lg"><span className="font-semibold text-gray-700">Customer:</span> {order.user}</p>
                <p className="text-lg"><span className="font-semibold text-gray-700">Amount:</span> {order.amount}</p>
                {/* You would add more details here like items, date, etc. */}
            </div>
            {/* Payment Information */}
<div className="space-y-2 p-4 bg-green-50 rounded-lg border border-gray-100">
  <p className="text-lg">
    <span className="font-semibold text-gray-700">Payment Method:</span> {order.payment?.method || '-'}
  </p>
  <p className="text-lg">
    <span className="font-semibold text-gray-700">Payment Status:</span> 
    <span className={`ml-2 font-medium ${
      order.payment?.status === 'Completed' ? 'text-green-500' :
      order.payment?.status === 'Pending' ? 'text-yellow-500' :
      'text-red-500'
    }`}>
      {order.payment?.status || '-'}
    </span>
  </p>
  {order.transactionId && (
    <p className="text-lg">
      <span className="font-semibold text-gray-700">Transaction ID:</span> {order.transactionId}
    </p>
  )}
</div>


            {/* Status Update Dropdown */}
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Update Status
                </label>
                <select
                    id="status"
                    name="status"
                    value={status}
                    onChange={handleStatusChange}
                    // Professional styling for the select dropdown
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm p-2 transition-colors duration-200"
                >
                    {statuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* Form Actions */}
            <div className="pt-4 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onClose}
                    // Styled 'Cancel' button with a subtle, professional look
                    className="px-6 py-2 flex items-center justify-center space-x-2 text-sm font-medium text-white bg-emerald-900 border border-gray-300 rounded-md shadow-sm hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                </button>
                <button
                    type="submit"
                    // Main action button with a professional gradient and icon
                    className="px-6 py-2 flex items-center justify-center space-x-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                    <Check className="h-4 w-4" />
                    <span>Save Changes</span>
                </button>
            </div>
        </form>
    );
};

export default OrderDetails;