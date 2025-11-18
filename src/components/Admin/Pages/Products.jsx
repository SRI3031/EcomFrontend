// src/components/Admin/Products.jsx
import { useLocation } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL,API_ENDPOINTS } from '@/config/api.js';
import Table from '../ReuseNav/Table';
import Modal from '../ReuseNav/Modal';
import ProductForm from '../ReuseNav/ProductForm';
import { PlusCircle, Pencil, Trash, Eye } from 'lucide-react'; // added Eye icon
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Products = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  //  New state for image preview
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
 //highlighted search 
 const [selectedProductId, setSelectedProductId] = useState(null);
// Auto-remove highlight after 2 seconds
const location = useLocation();
useEffect(() => {
  const idFromSearch = localStorage.getItem("highlightId");
  if (idFromSearch) {
    setSelectedProductId(idFromSearch);

    const timer = setTimeout(() => {
      setSelectedProductId(null);
      localStorage.removeItem("highlightId");
    }, 2000);

    return () => clearTimeout(timer);
  }
}, [location]); // run on mount
// Highlight scroll effect
useEffect(() => {
  if (selectedProductId) {
    const rowEl = document.getElementById(`row-${selectedProductId}`);
    if (rowEl) rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}, [selectedProductId]);


  // Fetch all products
// Fetch all products
const fetchProducts = async () => {
  try {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_BASE_URL}/${API_ENDPOINTS.ADD_PRODUCTS}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setProducts(res.data);
  } catch (err) {
    console.error(err);
    toast.error('Failed to fetch products');
  } finally {
    setIsLoading(false);
  }
};



  useEffect(() => {
    fetchProducts();
  }, []);

  // Open Add/Edit Product Modal
  const handleOpenFormModal = (product = null) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingProduct(null);
  };

  // Delete flow
  const handleOpenDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

const confirmDeleteProduct = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_BASE_URL}/${API_ENDPOINTS.ADD_PRODUCTS}/${productToDelete._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success(`Product '${productToDelete.name}' deleted successfully`);
    fetchProducts(); // refresh table
  } catch (err) {
    console.error(err);
    toast.error('Failed to delete product');
  } finally {
    handleCloseDeleteModal();
  }
};



  //  Open preview modal
  const handlePreviewImage = (imageUrl) => {
    setPreviewImageUrl(imageUrl);
    setIsPreviewModalOpen(true);
  };

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setPreviewImageUrl(null);
  };

  // Table columns
  const columns = [
    { header: 'Product Name', accessor: 'name' },
    { header: 'Category', accessor: 'category' },
      { header: 'Sub-Category', accessor: 'subcategory' },
    { header: 'Price', accessor: 'price' },
        { header: 'GST (%)', accessor: 'gst' },        // ← added
        { header: 'Discount (%)', accessor: 'discount' }, // ← added discount
  { header: 'Total Price', accessor: 'totalPrice' }, // ← added

    { header: 'Stock', accessor: 'stock' },
      { header: 'Description', accessor: 'description' },
  ];

  // Table actions
  const actions = (row) => (
    <div className="flex space-x-2 justify-end">
      {/*  Preview button */}
      <button
        onClick={() => handlePreviewImage(row.imageUrl)}
        className="text-gray-600 hover:text-gray-800"
        title="Preview"
      >
        <Eye className="h-5 w-5" />
      </button>

      <button
        onClick={() => handleOpenFormModal(row)}
        className="text-indigo-600 hover:text-indigo-800"
        title="Edit"
      >
        <Pencil className="h-5 w-5" />
      </button>

      <button
        onClick={() => handleOpenDeleteModal(row)}
        className="text-red-600 hover:text-red-800"
        title="Delete"
      >
        <Trash className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Product Management</h1>
        <button
          onClick={() => handleOpenFormModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-950 text-white font-medium rounded-md shadow-md hover:bg-amber-950/80"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Table / Loader */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 text-lg animate-pulse">Loading products...</p>
        </div>
      ) : (
        <Table columns={columns} data={products} actions={actions} selectedId={selectedProductId} onRowClick={(id) => setSelectedProductId(id)}  />
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal}>
        <ProductForm
          productToEdit={editingProduct}
          onClose={handleCloseFormModal}
          onSave={fetchProducts} // Refresh table after save
        />
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal}>
        <div className="text-center p-4">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Confirm Deletion</h3>
          <p className="text-gray-700 mb-6">
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold">{productToDelete?.name}</span>? This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <button
              onClick={confirmDeleteProduct}
              className="px-6 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              Yes, Delete
            </button>
            <button
              onClick={handleCloseDeleteModal}
              className="px-6 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              No, Keep It
            </button>
          </div>
        </div>
      </Modal>

      {/*  Image Preview Modal */}
      <Modal isOpen={isPreviewModalOpen} onClose={handleClosePreviewModal}>
        <div className="flex flex-col items-center">
          <img src={previewImageUrl} alt="Product Preview" className="max-w-full max-h-[60vh] rounded-md" />
          <button
            onClick={handleClosePreviewModal}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Toasts */}
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
};

export default Products;
