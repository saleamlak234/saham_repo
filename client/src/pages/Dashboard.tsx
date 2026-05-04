import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, TrendingUp, Users, Award, ArrowUpRight, ArrowDownRight, Eye, Copy, CircleCheck as CheckCircle, Clock, CreditCard, Smartphone, Lock, CircleAlert as AlertCircle, Video, Bell } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DebtPaymentModal from '../components/DebtPaymentModal';
import VideoReward from '../components/VideoReward';

interface DashboardStats {
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalCommissions: number;
  monthlyEarnings: number;
  directReferrals: number;
  totalTeamSize: number;
  recentTransactions: Transaction[];
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'commission';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
}

interface MerchantAccount {
  _id: string;
  name: string;
  type: 'bank' | 'mobile_money';
  accountNumber: string;
  accountName: string;
  bankName?: string;
  phoneNumber?: string;
  instructions: string;
}

interface WithdrawalSchedule {
  startHour: number;
  endHour: number;
  isActive: boolean;
}

const ETHIOPIAN_BANKS = [
  'CBE','Dashen Bank','Awash Bank','Abyssinia Bank','Wegagen Bank','United Bank',
  'Nib International Bank','Cooperative Bank of Oromia','Berhan International Bank',
  'Zemen Bank','Oromia International Bank','Debub Global Bank','Hijra Bank',
  'Amhara Bank','Goh Betoch Bank','Tsedey Bank','Siinqee Bank','Shabelle Bank',
  'Addis International Bank','Enat Bank','Abay Bank','Bunna Bank','Raya Bank'
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [merchantAccounts, setMerchantAccounts] = useState<MerchantAccount[]>([]);
  const [withdrawalSchedule, setWithdrawalSchedule] = useState<WithdrawalSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReferralCode, setShowReferralCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [isDashboardLocked, setIsDashboardLocked] = useState(false);
  const [debtAmount, setDebtAmount] = useState(0);
  const [uplineInfo, setUplineInfo] = useState<any>(null);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [debtSubmitSuccess, setDebtSubmitSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'videos'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, merchantRes, scheduleRes, pendingRes] = await Promise.all([
        axios.get('/dashboard/stats'),
        axios.get('/deposits/merchant-accounts').catch(() => ({ data: { merchantAccounts: [] } })),
        axios.get('/withdrawals/schedule').catch(() => ({ data: { schedule: null } })),
        axios.get('/payments/pending').catch(() => ({ data: [] }))
      ]);

      setStats(statsRes.data);
      setMerchantAccounts(merchantRes.data.merchantAccounts || []);
      setWithdrawalSchedule(scheduleRes.data.schedule);
      setPendingPaymentsCount(pendingRes.data.length || 0);

      // Check debt status from fresh user data
      const meRes = await axios.get('/auth/me');
      const freshUser = meRes.data?.user;
      if (freshUser?.isDashboardLocked && freshUser?.debtAmount > 0) {
        setIsDashboardLocked(true);
        setDebtAmount(freshUser.debtAmount);
        // Get upline payment info
        const uplineRes = await axios.get('/payments/upline-payment-info').catch(() => null);
        if (uplineRes) setUplineInfo(uplineRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (user?.referralCode) {
      await navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyReferralLink = async () => {
    const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAccountNumber = async (accountNumber: string) => {
    await navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isWithdrawalTime = () => {
    if (!withdrawalSchedule) return true;
    const now = new Date();
    const h = now.getHours();
    return h >= withdrawalSchedule.startHour && h <= withdrawalSchedule.endHour;
  };

  const handleDebtSubmit = async (formData: FormData) => {
    await axios.post('/payments/submit-debt-payment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setDebtSubmitSuccess(true);
    setShowDebtModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }

  // ── LOCKED DASHBOARD ────────────────────────────────────────────────────────
  if (isDashboardLocked && debtAmount > 0) {
    return (
      <div className="min-h-screen py-8 bg-red-50">
        <div className="px-4 mx-auto max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <Lock className="w-8 h-8 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Locked</h1>
          </div>

          {debtSubmitSuccess ? (
            <div className="bg-white border border-green-200 rounded-xl p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Submitted!</h2>
              <p className="text-gray-600">Your payment receipt has been sent to your parent for review. Your dashboard will be unlocked once approved.</p>
            </div>
          ) : (
            <div className="bg-white border border-red-200 rounded-xl p-6 space-y-6">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-gray-900 mb-1">Outstanding Debt</h2>
                <p className="text-gray-500 text-sm">Pay your debt to unlock full access</p>
              </div>

              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Amount Due</p>
                <p className="text-4xl font-bold text-red-600">{debtAmount.toFixed(2)} ETB</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  <p className="text-gray-700">Transfer <strong>{debtAmount.toFixed(2)} ETB</strong> to your parent's account using one of their listed payment methods.</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  <p className="text-gray-700">Click "Pay Debt" and upload the payment receipt with the reference number.</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  <p className="text-gray-700">Your parent reviews and approves. Dashboard unlocks automatically.</p>
                </div>
              </div>

              <button
                onClick={() => setShowDebtModal(true)}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Pay Debt Now
              </button>
            </div>
          )}
        </div>

        <DebtPaymentModal
          isOpen={showDebtModal}
          onClose={() => setShowDebtModal(false)}
          onSubmit={handleDebtSubmit}
          uplinePaymentInfo={uplineInfo}
          debtAmount={debtAmount}
          banks={ETHIOPIAN_BANKS}
        />
      </div>
    );
  }

  // ── ACTIVE DASHBOARD ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.fullName}!</h1>
            <p className="mt-1 text-gray-600">Investment portfolio & earnings overview</p>
          </div>
          {pendingPaymentsCount > 0 && (
            <Link
              to="/pending-payments"
              className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 border border-orange-200 rounded-lg hover:bg-orange-200 transition"
            >
              <Bell className="w-4 h-4" />
              <span className="font-medium">{pendingPaymentsCount} Pending Payment{pendingPaymentsCount > 1 ? 's' : ''}</span>
            </Link>
          )}
        </div>

        {/* Withdrawal Alert */}
        {withdrawalSchedule && !isWithdrawalTime() && (
          <div className="flex items-center gap-2 p-4 mb-6 border border-yellow-200 rounded-lg bg-yellow-50">
            <Clock className="flex-shrink-0 w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800">
              Withdrawals available {withdrawalSchedule.startHour}:00 – {withdrawalSchedule.endHour}:00 daily.
            </span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalBalance || user?.balance || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="mt-3 text-xs text-green-600 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Available for withdrawal
            </p>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Deposits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalDeposits || user?.totalDeposits || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">Total invested amount</p>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Commissions Earned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalCommissions || user?.totalCommissions || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="mt-3 text-xs text-amber-600">From referral network</p>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Team Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalTeamSize || user?.totalTeamSize || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              {stats?.directReferrals || user?.directReferrals || 0} direct referrals
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-1.5 ${
              activeTab === 'videos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Video className="w-4 h-4" /> Watch & Earn
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'videos' ? (
          <VideoReward onRewardClaimed={fetchDashboardData} />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Referral Card */}
              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <h3 className="mb-4 text-base font-semibold text-gray-900">Referral Program</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Your Referral Code
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                        <span className="font-mono text-base font-semibold text-primary-600">
                          {showReferralCode ? user?.referralCode : '••••••••'}
                        </span>
                      </div>
                      <button onClick={() => setShowReferralCode(!showReferralCode)} className="p-2 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={copyReferralCode} className="p-2 text-gray-400 hover:text-gray-600">
                        {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={copyReferralLink}
                    className="w-full px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700 transition"
                  >
                    {copied ? 'Link Copied!' : 'Copy Referral Link'}
                  </button>

                  {/* Commission Structure */}
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <h4 className="text-xs font-semibold text-amber-900 uppercase tracking-wide mb-2">Commission Structure</h4>
                    <div className="space-y-1 text-sm">
                      {[['Generation 1', '8%'], ['Generation 2', '6%'], ['Generation 3', '4%']].map(([label, rate]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-amber-700">{label}:</span>
                          <span className="font-bold text-amber-900">{rate}</span>
                        </div>
                      ))}
                      <div className="pt-1 mt-1 border-t border-amber-200 text-xs text-amber-600">
                        4th generation onwards → Company
                      </div>
                    </div>
                  </div>

                  {/* Monthly Salary Table */}
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <h4 className="text-xs font-semibold text-green-900 uppercase tracking-wide mb-2">Monthly Salary Bonus</h4>
                    <div className="space-y-0.5 text-xs text-green-700">
                      {[
                        ['13 directs', '10,000'],
                        ['20 directs', '17,000'],
                        ['30 directs', '25,000'],
                        ['40 directs', '35,000'],
                        ['40 + 500 team', '80,000'],
                        ['40 + 1000 team', '150,000'],
                      ].map(([cond, bonus]) => (
                        <div key={cond} className="flex justify-between">
                          <span>{cond}:</span>
                          <span className="font-semibold">{bonus} ETB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Accounts */}
              {merchantAccounts.length > 0 && (
                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                  <h3 className="mb-4 text-base font-semibold text-gray-900">Payment Accounts</h3>
                  <div className="space-y-3">
                    {merchantAccounts.map((account) => (
                      <div key={account._id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {account.type === 'bank'
                            ? <CreditCard className="w-4 h-4 text-blue-600" />
                            : <Smartphone className="w-4 h-4 text-green-600" />}
                          <span className="font-medium text-sm text-gray-900">{account.name}</span>
                        </div>
                        <div className="text-xs space-y-1 text-gray-600">
                          <div className="flex justify-between">
                            <span>Account:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono">{account.accountNumber}</span>
                              <button onClick={() => copyAccountNumber(account.accountNumber)}>
                                <Copy className="w-3 h-3 text-primary-500" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span>Name:</span><span>{account.accountName}</span>
                          </div>
                          {account.bankName && (
                            <div className="flex justify-between">
                              <span>Bank:</span><span>{account.bankName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Recent Transactions */}
            <div className="lg:col-span-2">
              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <h3 className="mb-4 text-base font-semibold text-gray-900">Recent Transactions</h3>
                {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            tx.type === 'deposit' ? 'bg-green-100' :
                            tx.type === 'withdrawal' ? 'bg-red-100' : 'bg-amber-100'
                          }`}>
                            {tx.type === 'deposit'
                              ? <ArrowDownRight className="w-4 h-4 text-green-600" />
                              : tx.type === 'withdrawal'
                              ? <ArrowUpRight className="w-4 h-4 text-red-600" />
                              : <Award className="w-4 h-4 text-amber-600" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">{tx.type}</p>
                            <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${
                            tx.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {tx.type === 'withdrawal' ? '-' : '+'}{tx.amount.toLocaleString()} ETB
                          </p>
                          <p className={`text-xs ${
                            tx.status === 'completed' ? 'text-green-500' :
                            tx.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {tx.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-gray-400">No transactions yet</p>
                    <Link to="/deposits" className="mt-3 inline-block px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700">
                      Make your first deposit
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <DebtPaymentModal
        isOpen={showDebtModal}
        onClose={() => setShowDebtModal(false)}
        onSubmit={handleDebtSubmit}
        uplinePaymentInfo={uplineInfo}
        debtAmount={debtAmount}
        banks={ETHIOPIAN_BANKS}
      />
    </div>
  );
}
