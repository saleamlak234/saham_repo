import React, { useState, useEffect } from 'react';
import { CircleCheck as CheckCircle, Circle as XCircle, Download, Eye, Clock } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface PaymentRequest {
  _id: string;
  fromUserId: { _id: string; fullName: string; email: string; phoneNumber: string };
  amount: number;
  debtAmount: number;
  type: string;
  referenceNumber: string;
  receiptUrl: string;
  receiptFileName: string;
  status: 'pending' | 'approved' | 'rejected';
  selectedPaymentMethod: {
    methodType: string;
    bankName?: string;
    phoneNumber?: string;
    accountNumber?: string;
    accountName?: string;
  };
  createdAt: string;
  relatedDepositId?: any;
}

export default function ParentPendingPayments() {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await axios.get('/payments/pending');
      setPayments(res.data);
    } catch (err) {
      console.error('Error loading pending payments:', err);
      setError('Error loading pending payments');
    } finally {
      setLoading(false);
    }
  };

  const approvePayment = async (id: string) => {
    try {
      setProcessingId(id);
      setError('');
      const endpoint = payments.find(p => p._id === id)?.type === 'deposit_payment' && payments.find(p => p._id === id)?.debtAmount === 0
        ? `/payments/approve/${id}`
        : `/payments/approve-debt/${id}`;
      await axios.post(endpoint);
      setMessage('Payment approved successfully!');
      fetchPending();
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error approving payment');
    } finally {
      setProcessingId(null);
    }
  };

  const rejectPayment = async (id: string) => {
    if (!rejectionReason.trim()) {
      setError('Please enter a rejection reason');
      return;
    }
    try {
      setProcessingId(id);
      setError('');
      await axios.post(`/payments/reject/${id}`, { rejectionReason });
      setMessage('Payment rejected.');
      setRejectingId(null);
      setRejectionReason('');
      fetchPending();
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error rejecting payment');
    } finally {
      setProcessingId(null);
    }
  };

  const downloadReceipt = (paymentId: string) => {
    const token = localStorage.getItem('token');
    window.open(`/api/payments/receipt/${paymentId}?download=true`, '_blank');
  };

  const viewReceipt = (url: string) => {
    setPreviewUrl(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-b-2 border-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pending Payment Approvals</h1>
            <p className="text-gray-500 text-sm mt-1">Review and approve/reject payment receipts from your referrals</p>
          </div>
          <Link to="/dashboard" className="text-sm text-primary-600 hover:text-primary-700">← Back to Dashboard</Link>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{message}</div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {payments.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No pending payments</p>
            <p className="text-xs text-gray-400 mt-1">Payments from your referrals will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">{payment.fromUserId.fullName}</p>
                    <p className="text-sm text-gray-500">{payment.fromUserId.phoneNumber} · {payment.fromUserId.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{payment.amount.toLocaleString()} ETB</p>
                    <p className="text-xs text-gray-500">
                      {payment.type === 'deposit_payment' && payment.debtAmount === 0 ? 'Deposit Payment' : 'Debt Payment'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Payment Method</p>
                    <p className="font-medium text-gray-900">
                      {payment.selectedPaymentMethod.methodType === 'bank'
                        ? payment.selectedPaymentMethod.bankName
                        : payment.selectedPaymentMethod.methodType === 'telebirr'
                        ? 'Telebirr'
                        : 'CBE Birr'}
                    </p>
                    {payment.selectedPaymentMethod.phoneNumber && (
                      <p className="text-xs text-gray-500">{payment.selectedPaymentMethod.phoneNumber}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Reference No.</p>
                    <p className="font-mono text-sm font-medium text-gray-900">{payment.referenceNumber}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Submitted</p>
                    <p className="font-medium text-gray-900 text-xs">{new Date(payment.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => viewReceipt(`/api/payments/receipt/${payment._id}`)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4" /> View Receipt
                  </button>
                  <button
                    onClick={() => downloadReceipt(payment._id)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button
                    onClick={() => approvePayment(payment._id)}
                    disabled={processingId === payment._id}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {processingId === payment._id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => setRejectingId(payment._id)}
                    disabled={processingId === payment._id}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-700 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>

                {/* Rejection Form */}
                {rejectingId === payment._id && (
                  <div className="mt-3 p-4 bg-red-50 border border-red-100 rounded-lg space-y-3">
                    <textarea
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder="Reason for rejection (required)..."
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => rejectPayment(payment._id)}
                        disabled={processingId === payment._id || !rejectionReason.trim()}
                        className="flex-1 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                        className="flex-1 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="max-w-3xl max-h-[90vh] overflow-auto bg-white rounded-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <p className="font-medium text-gray-900">Payment Receipt</p>
              <button onClick={() => setPreviewUrl(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4">
              <img src={previewUrl} alt="Receipt" className="max-w-full rounded-lg" onError={() => {
                // If image fails, try to show in iframe (PDF)
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
