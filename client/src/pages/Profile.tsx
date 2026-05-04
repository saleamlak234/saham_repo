import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Calendar, Award, Users, TrendingUp, CreditCard as Edit3, Save, X, Shield, CircleCheck as CheckCircle, CreditCard, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

const ETHIOPIAN_BANKS = [
  'Abyssinia Bank', 'Addis International Bank', 'Ahadu Bank', 'Amhara Bank',
  'Awash Bank', 'Berhan Bank', 'Bunna Bank', 'Commercial Bank of Ethiopia (CBE)',
  'Cooperative Bank of Oromia', 'Dashen Bank', 'Enat Bank', 'Gadaa Bank',
  'Global Bank Ethiopia', 'Goh Betoch Bank', 'Hibret Bank', 'Hijra Bank',
  'Lion International Bank', 'Nib International Bank', 'Oromia Bank',
  'Premier Bank', 'Siinqee Bank', 'Tsedey Bank', 'Tsehay Bank',
  'Wegagen Bank', 'ZamZam Bank', 'Zemen Bank'
];

interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName: string;
  isDefault: boolean;
}

interface PaymentInfo {
  bankAccounts: BankAccount[];
  telebirr: { phoneNumber: string; fullName: string; isActive: boolean };
  cbeBirr: { phoneNumber: string; fullName: string; isActive: boolean };
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || ''
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    bankAccounts: (user as any)?.paymentInfo?.bankAccounts || [],
    telebirr: (user as any)?.paymentInfo?.telebirr || { phoneNumber: '', fullName: '', isActive: false },
    cbeBirr: (user as any)?.paymentInfo?.cbeBirr || { phoneNumber: '', fullName: '', isActive: false }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put('/user/profile', formData);
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);
    setPaymentError('');
    setPaymentSuccess('');

    try {
      const response = await axios.put('/user/payment-info', paymentInfo);
      updateUser(response.data.user);
      setPaymentSuccess('Payment info updated successfully!');
      setIsEditingPayment(false);
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || 'Failed to update payment info');
    } finally {
      setPaymentLoading(false);
    }
  };

  const addBankAccount = () => {
    setPaymentInfo(prev => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, { bankName: '', accountName: '', accountNumber: '', branchName: '', isDefault: false }]
    }));
  };

  const removeBankAccount = (index: number) => {
    setPaymentInfo(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter((_, i) => i !== index)
    }));
  };

  const updateBankAccount = (index: number, field: keyof BankAccount, value: string | boolean) => {
    setPaymentInfo(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map((acc, i) => i === index ? { ...acc, [field]: value } : acc)
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({ fullName: user?.fullName || '', phoneNumber: user?.phoneNumber || '' });
    setError('');
  };

  const cancelPaymentEdit = () => {
    setIsEditingPayment(false);
    setPaymentInfo({
      bankAccounts: (user as any)?.paymentInfo?.bankAccounts || [],
      telebirr: (user as any)?.paymentInfo?.telebirr || { phoneNumber: '', fullName: '', isActive: false },
      cbeBirr: (user as any)?.paymentInfo?.cbeBirr || { phoneNumber: '', fullName: '', isActive: false }
    });
    setPaymentError('');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and payment details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <button onClick={cancelEdit} className="flex items-center space-x-1 text-gray-600 hover:text-gray-700">
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              <div className="p-6">
                {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}
                {success && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      {isEditing ? (
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{user.fullName}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      {isEditing ? (
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{user.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{user.email}</span>
                      <span className="text-xs text-gray-500">(Cannot be changed)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {isEditing && (
                    <button type="submit" disabled={loading}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2">
                      {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="h-4 w-4" /><span>Save Changes</span></>}
                    </button>
                  )}
                </form>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Your children will use these details to pay you</p>
                </div>
                {!isEditingPayment ? (
                  <button onClick={() => setIsEditingPayment(true)} className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <button onClick={cancelPaymentEdit} className="flex items-center space-x-1 text-gray-600 hover:text-gray-700">
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              <div className="p-6">
                {paymentError && <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{paymentError}</div>}
                {paymentSuccess && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>{paymentSuccess}</span>
                  </div>
                )}

                {!isEditingPayment ? (
                  /* View mode */
                  <div className="space-y-4">
                    {/* Bank Accounts */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Bank Accounts
                      </h3>
                      {(user as any)?.paymentInfo?.bankAccounts?.length > 0 ? (
                        <div className="space-y-2">
                          {(user as any).paymentInfo.bankAccounts.map((acc: BankAccount, i: number) => (
                            <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-gray-900">{acc.bankName}</span>
                                {acc.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>}
                              </div>
                              <p className="text-gray-600">{acc.accountName} — {acc.accountNumber}</p>
                              {acc.branchName && <p className="text-gray-500 text-xs mt-0.5">Branch: {acc.branchName}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No bank accounts added</p>
                      )}
                    </div>

                    {/* Telebirr */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Telebirr</h3>
                      {(user as any)?.paymentInfo?.telebirr?.isActive ? (
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <p className="text-gray-900 font-medium">{(user as any).paymentInfo.telebirr.fullName}</p>
                          <p className="text-gray-600">{(user as any).paymentInfo.telebirr.phoneNumber}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Not configured</p>
                      )}
                    </div>

                    {/* CBE Birr */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">CBE Birr</h3>
                      {(user as any)?.paymentInfo?.cbeBirr?.isActive ? (
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <p className="text-gray-900 font-medium">{(user as any).paymentInfo.cbeBirr.fullName}</p>
                          <p className="text-gray-600">{(user as any).paymentInfo.cbeBirr.phoneNumber}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Not configured</p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Edit mode */
                  <form onSubmit={handlePaymentInfoSubmit} className="space-y-6">
                    {/* Bank Accounts */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" /> Bank Accounts
                        </h3>
                        <button type="button" onClick={addBankAccount}
                          className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                          <Plus className="h-3 w-3" /> Add Account
                        </button>
                      </div>

                      <div className="space-y-4">
                        {paymentInfo.bankAccounts.map((acc, i) => (
                          <div key={i} className="border border-gray-200 rounded-lg p-4 relative">
                            <button type="button" onClick={() => removeBankAccount(i)}
                              className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Bank Name *</label>
                                <select value={acc.bankName} onChange={e => updateBankAccount(i, 'bankName', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required>
                                  <option value="">Select bank...</option>
                                  {ETHIOPIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Account Name *</label>
                                <input type="text" value={acc.accountName} onChange={e => updateBankAccount(i, 'accountName', e.target.value)}
                                  placeholder="Full name on account"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Account Number *</label>
                                <input type="text" value={acc.accountNumber} onChange={e => updateBankAccount(i, 'accountNumber', e.target.value)}
                                  placeholder="e.g. 1234567890"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Branch (optional)</label>
                                <input type="text" value={acc.branchName} onChange={e => updateBankAccount(i, 'branchName', e.target.value)}
                                  placeholder="Branch name"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                              </div>
                            </div>
                            <label className="flex items-center gap-2 mt-3 text-sm cursor-pointer">
                              <input type="checkbox" checked={acc.isDefault} onChange={e => updateBankAccount(i, 'isDefault', e.target.checked)}
                                className="rounded text-primary-600" />
                              <span className="text-gray-600">Set as default</span>
                            </label>
                          </div>
                        ))}
                        {paymentInfo.bankAccounts.length === 0 && (
                          <p className="text-sm text-gray-400 italic text-center py-3">No bank accounts — click "Add Account" to add one</p>
                        )}
                      </div>
                    </div>

                    {/* Telebirr */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700">Telebirr</h3>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={paymentInfo.telebirr.isActive}
                            onChange={e => setPaymentInfo(prev => ({ ...prev, telebirr: { ...prev.telebirr, isActive: e.target.checked } }))}
                            className="rounded text-primary-600" />
                          <span className="text-gray-600">Active</span>
                        </label>
                      </div>
                      {paymentInfo.telebirr.isActive && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                            <input type="text" value={paymentInfo.telebirr.fullName}
                              onChange={e => setPaymentInfo(prev => ({ ...prev, telebirr: { ...prev.telebirr, fullName: e.target.value } }))}
                              placeholder="Name on Telebirr account"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
                            <input type="tel" value={paymentInfo.telebirr.phoneNumber}
                              onChange={e => setPaymentInfo(prev => ({ ...prev, telebirr: { ...prev.telebirr, phoneNumber: e.target.value } }))}
                              placeholder="e.g. 0911234567"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CBE Birr */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700">CBE Birr</h3>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={paymentInfo.cbeBirr.isActive}
                            onChange={e => setPaymentInfo(prev => ({ ...prev, cbeBirr: { ...prev.cbeBirr, isActive: e.target.checked } }))}
                            className="rounded text-primary-600" />
                          <span className="text-gray-600">Active</span>
                        </label>
                      </div>
                      {paymentInfo.cbeBirr.isActive && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                            <input type="text" value={paymentInfo.cbeBirr.fullName}
                              onChange={e => setPaymentInfo(prev => ({ ...prev, cbeBirr: { ...prev.cbeBirr, fullName: e.target.value } }))}
                              placeholder="Name on CBE Birr account"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
                            <input type="tel" value={paymentInfo.cbeBirr.phoneNumber}
                              onChange={e => setPaymentInfo(prev => ({ ...prev, cbeBirr: { ...prev.cbeBirr, phoneNumber: e.target.value } }))}
                              placeholder="e.g. 0911234567"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                          </div>
                        </div>
                      )}
                    </div>

                    {paymentError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{paymentError}</div>}

                    <button type="submit" disabled={paymentLoading}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2">
                      {paymentLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="h-4 w-4" /><span>Save Payment Info</span></>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="flex items-center space-x-1">
                    <Shield className="h-4 w-4 text-primary-500" />
                    <span className="text-gray-900 capitalize">{user.role}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Level:</span>
                  <span className="text-gray-900">{user.level}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Deposits</p>
                    <p className="font-semibold text-gray-900">{user.totalDeposits.toLocaleString()} ETB</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Award className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Commissions</p>
                    <p className="font-semibold text-gray-900">{user.totalCommissions.toLocaleString()} ETB</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <Users className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Team Size</p>
                    <p className="font-semibold text-gray-900">{user.totalTeamSize} members</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Info */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">Referral Code</h3>
              <div className="bg-white rounded-lg p-3 mb-3">
                <p className="font-mono text-lg font-bold text-primary-600 text-center">{user.referralCode}</p>
              </div>
              <p className="text-sm text-primary-700">Share this code to earn commissions from new members</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
