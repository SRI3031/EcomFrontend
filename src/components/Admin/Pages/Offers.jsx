// Offers.jsx (Updated File)
import React, { useState } from 'react';
import { Send, Gift, Loader2 } from 'lucide-react';
import axios from 'axios'; // <-- ADD THIS
// Assuming your config file is located at the root level or accessible via this import
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api.js'; // <-- ADD THIS

const Offers = () => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(null); // null, 'success', or 'error'

    const handleSendOffer = async (e) => {
        e.preventDefault();

        if (!subject.trim() || !body.trim()) {
            alert('Please enter both a subject and a body for the offer email.');
            return;
        }

        setIsSending(true);
        setSendSuccess(null); // Reset status

        
        //  ACTUAL API CALL IMPLEMENTATION
       
        const token = localStorage.getItem("token"); 

        if (!token) {
            alert('Authentication failed. Please log in again.');
            setIsSending(false);
            return;
        }

        console.log('Attempting to send bulk email:', { subject, body });

        try {
            const response = await axios.post(
                `${API_BASE_URL}/${API_ENDPOINTS.BULK_EMAIL_SEND}`, // Use the new constant
                { subject, body },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                setSendSuccess('success');
                setSubject('');
                setBody('');
            } else {
                setSendSuccess('error');
            }

        } catch (error) {
            console.error('Error sending bulk email:', error.response?.data?.message || error.message);
            const errorMessage = error.response?.data?.message || 'Failed to connect to the email server.';
            if (error.response?.status === 403) {
                 alert(`Authorization failed: ${errorMessage}`);
            } else {
                 alert(`Sending failed: ${errorMessage}`);
            }
            
            setSendSuccess('error');
        } finally {
            setIsSending(false);
            // Clear success/error message after a few seconds
            setTimeout(() => setSendSuccess(null), 5000); 
        }
    };


    return (
        <div className="p-4 sm:p-8 bg-white/5 backdrop-blur-md rounded-xl shadow-2xl min-h-full text-gray-100">
            
            <header className="flex items-center gap-4 border-b border-lime-700/50 pb-4 mb-8">
                <Gift className="w-8 h-8 text-lime-400" />
                <h1 className="text-3xl font-extrabold text-white tracking-wider">
                    Bulk Offer & Promotion Sender
                </h1>
            </header>

            <section className="max-w-3xl mx-auto">
                <p className="text-gray-400 mb-6 text-lg">
                    Compose a marketing email below. This will be sent instantly to 
                    <strong className="text-lime-300"> ALL registered customers</strong>.
                </p>

                <form onSubmit={handleSendOffer} className="space-y-6">
                    
                    {/* Subject Field */}
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-lime-400 mb-2">
                            Email Subject Line (e.g., 20% OFF All GreenRemedy Products!)
                        </label>
                        <input
                            id="subject"
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            disabled={isSending}
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                            placeholder="Enter the catchy subject line"
                            required
                        />
                    </div>

                    {/* Body/Content Field */}
                    <div>
                        <label htmlFor="body" className="block text-sm font-medium text-lime-400 mb-2">
                            Email Body Content
                        </label>
                        <textarea
                            id="body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            disabled={isSending}
                            rows="10"
                            className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors resize-y"
                            placeholder="Write your special offer details, coupon codes, and link to your store here..."
                            required
                        />
                    </div>

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={isSending}
                        className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${
                            isSending
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-lime-500 hover:bg-lime-600 text-lime-900 transform hover:scale-[1.01] ring-2 ring-lime-400/50'
                        }`}
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Sending Offers...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Send Email to All Customers
                            </>
                        )}
                    </button>
                    
                    {/* Status Message */}
                    {sendSuccess === 'success' && (
                        <div className="mt-4 p-4 bg-green-900/50 border border-green-500 rounded-lg text-green-300 text-center font-semibold">
                            ✅ Success! Bulk email campaign has been successfully queued for sending.
                        </div>
                    )}
                    {sendSuccess === 'error' && (
                        <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-center font-semibold">
                            ❌ Error! Failed to send offers. Please check the server logs.
                        </div>
                    )}
                </form>
            </section>
        </div>
    );
};

export default Offers;
