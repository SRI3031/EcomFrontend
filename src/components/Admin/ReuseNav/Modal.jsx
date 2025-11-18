import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { XCircle } from "lucide-react";

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-overlay") onClose();
  };

  const modalContent = (
    <div
      id="modal-overlay"
      onClick={handleOutsideClick}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
    >
      <div
        className="relative w-full max-w-lg mx-auto bg-blue-50 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
          onClick={onClose}
        >
          <XCircle size={24} />
        </button>
        <div className="p-6 pt-10">{children}</div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.getElementById("modal-root"));
};

export default Modal;
