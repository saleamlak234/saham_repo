import React, { useState } from 'react';

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  uplinePaymentInfo?: any;
  debtAmount: number;
  banks: string[];
}

type MethodType = 'bank' | 'telebirr' | 'cbeBirr';

export default function DebtPaymentModal({
  isOpen, onClose, onSubmit, uplinePaymentInfo, debtAmount, banks
}: DebtPaymentModalProps) {
  const [method, setMethod] = useState<MethodType>('bank');
  const [selectedBank, setSelectedBank] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const uplineAccInfo = uplinePaymentInfo?.paymentInfo;

  const getBankAccountDetails = (bankName: string) => {
    return uplineAccInfo?.bankAccounts?.find((a: any) => a.bankName === bankName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!referenceNumber.trim()) { setError('Reference number is required'); return; }
    if (!file) { setError('Receipt file is required'); return; }
    if (method === 'bank' && !selectedBank) { setError('Please select a bank'); return; }

    const bankAcc = method === 'bank' ? getBankAccountDetails(selectedBank) : null;

    const fd = new FormData();
    fd.append('methodType', method);
    fd.append('bankName', method === 'bank' ? selectedBank : '');
    fd.append('phoneNumber', method === 'telebirr'
      ? (uplineAccInfo?.telebirr?.phoneNumber || '')
      : method === 'cbeBirr'
      ? (uplineAccInfo?.cbeBirr?.phoneNumber || '')
      : '');
    fd.append('accountNumber', bankAcc?.accountNumber || '');
    fd.append('accountName', bankAcc?.accountName || method === 'telebirr'
      ? (uplineAccInfo?.telebirr?.fullName || '')
      : (uplineAccInfo?.cbeBirr?.fullName || ''));
    fd.append('referenceNumber', referenceNumber);
    fd.append('receipt', file);

    try {
      setSubmitting(true);
      await onSubmit(fd);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const methodLabel = { bank: 'Bank Transfer', telebirr: 'Telebirr', cbeBirr: 'CBE Birr' }[method];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-blue-600 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-white">Pay Debt – {debtAmount.toFixed(2)} ETB</h2>
          <button onClick={onClose} disabled={submitting} className="text-blue-100 hover:text-white text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-5">
            {/* Amount */}
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Total Amount Due</p>
              <p className="text-3xl font-bold text-red-600">{debtAmount.toFixed(2)} ETB</p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {(['bank', 'telebirr', 'cbeBirr'] as MethodType[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMethod(m); setSelectedBank(''); }}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                      method === m ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {m === 'bank' ? 'Bank' : m === 'telebirr' ? 'Telebirr' : 'CBE Birr'}
                  </button>
                ))}
              </div>
            </div>

            {/* Bank Selection */}
            {method === 'bank' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Bank</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {banks.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBank(b)}
                      className={`px-2 py-1.5 text-xs rounded border transition ${
                        selectedBank === b
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Account Details Display */}
            {method === 'bank' && selectedBank && (() => {
              const acc = getBankAccountDetails(selectedBank);
              return acc ? (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm space-y-1">
                  <p className="font-semibold text-blue-900 mb-2">Pay to: {selectedBank}</p>
                  <div className="flex justify-between"><span className="text-gray-500">Account Name:</span><span className="font-medium">{acc.accountName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Account No:</span><span className="font-mono font-medium">{acc.accountNumber}</span></div>
                  {acc.branchName && <div className="flex justify-between"><span className="text-gray-500">Branch:</span><span>{acc.branchName}</span></div>}
                </div>
              ) : (
                <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">Parent hasn't added {selectedBank} account details yet.</p>
              );
            })()}

            {method === 'telebirr' && uplineAccInfo?.telebirr?.isActive && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm space-y-1">
                <p className="font-semibold text-blue-900 mb-2">Pay to: Telebirr</p>
                <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-medium">{uplineAccInfo.telebirr.fullName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span className="font-mono font-medium">{uplineAccInfo.telebirr.phoneNumber}</span></div>
              </div>
            )}

            {method === 'cbeBirr' && uplineAccInfo?.cbeBirr?.isActive && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm space-y-1">
                <p className="font-semibold text-blue-900 mb-2">Pay to: CBE Birr</p>
                <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-medium">{uplineAccInfo.cbeBirr.fullName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span className="font-mono font-medium">{uplineAccInfo.cbeBirr.phoneNumber}</span></div>
              </div>
            )}

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Transaction Reference Number *</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={e => setReferenceNumber(e.target.value)}
                placeholder="Enter reference/transaction ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Receipt *</label>
              <label className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition">
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  disabled={submitting}
                />
                {file ? (
                  <p className="text-sm text-green-700 font-medium">✓ {file.name}</p>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500">Click to upload (JPG, PNG, PDF)</p>
                    <p className="text-xs text-gray-400 mt-0.5">Max 10MB</p>
                  </div>
                )}
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
