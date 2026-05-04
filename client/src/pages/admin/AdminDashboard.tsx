import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, DollarSign, TrendingUp, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Clock, ArrowUpRight, ArrowDownRight, Eye, UserCheck, UserX, Video, ChartBar as BarChart2, CirclePlay as PlayCircle, Wallet } from 'lucide-react';
import axios from 'axios';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalCommissions: number;
  monthlyRevenue: number;
  recentTransactions: Transaction[];
  recentUsers: User[];
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  user: {
    fullName: string;
    email: string;
  };
  createdAt: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  totalDeposits: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [analytics, setAnalytics] = useState<any>(null);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [monthlySalaries, setMonthlySalaries] = useState<any[]>([]);
  const [payingSalaryId, setPayingSalaryId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminStats();
    fetchAnalytics('month');
    fetchMonthlySalaries();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await axios.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (period: string, start?: string, end?: string) => {
    try {
      let url = `/admin/analytics?period=${period}`;
      if (period === 'custom' && start && end) {
        url += `&startDate=${start}&endDate=${end}`;
      }
      const res = await axios.get(url);
      setAnalytics(res.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchMonthlySalaries = async () => {
    try {
      const res = await axios.get('/admin/monthly-salaries');
      setMonthlySalaries(res.data);
    } catch (err) {
      console.error('Failed to fetch monthly salaries:', err);
    }
  };

  const paySalary = async (userId: string) => {
    try {
      setPayingSalaryId(userId);
      await axios.post(`/admin/pay-monthly-salary/${userId}`);
      fetchMonthlySalaries();
      fetchAdminStats();
    } catch (err) {
      console.error('Failed to pay salary:', err);
    } finally {
      setPayingSalaryId(null);
    }
  };

  const handleAnalyticsPeriodChange = (period: 'today' | 'week' | 'month' | 'custom') => {
    setAnalyticsPeriod(period);
    if (period !== 'custom') fetchAnalytics(period);
  };

  const handleCustomAnalytics = () => {
    if (customStart && customEnd) fetchAnalytics('custom', customStart, customEnd);
  };

  const handleUserStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await axios.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      fetchAdminStats(); // Refresh data
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600">Manage platform operations and monitor performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalUsers || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-600">
                {stats?.activeUsers || 0} active users
              </span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deposits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalDeposits || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ArrowDownRight className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-yellow-600">
                {stats?.pendingDeposits || 0} pending
              </span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Withdrawals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalWithdrawals || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <ArrowUpRight className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-yellow-600">
                {stats?.pendingWithdrawals || 0} pending
              </span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.monthlyRevenue || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-blue-600">This month</span>
            </div>
          </div>
        </div>

        {/* Time-Based Analytics */}
        <div className="p-6 mb-8 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" /> Analytics
            </h2>
            <div className="flex gap-2 flex-wrap">
              {(['today', 'week', 'month'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => handleAnalyticsPeriodChange(p)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                    analyticsPeriod === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
                </button>
              ))}
              <button
                onClick={() => setAnalyticsPeriod('custom')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                  analyticsPeriod === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Custom Range
              </button>
            </div>
          </div>

          {analyticsPeriod === 'custom' && (
            <div className="flex gap-3 mb-5 flex-wrap">
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <button onClick={handleCustomAnalytics}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                Apply
              </button>
            </div>
          )}

          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Deposits</p>
                <p className="text-xl font-bold text-green-700">{(analytics.deposits?.total || 0).toLocaleString()} ETB</p>
                <p className="text-xs text-gray-400">{analytics.deposits?.count || 0} transactions</p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Withdrawals</p>
                <p className="text-xl font-bold text-red-700">{(analytics.withdrawals?.total || 0).toLocaleString()} ETB</p>
                <p className="text-xs text-gray-400">{analytics.withdrawals?.count || 0} transactions</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Commissions Paid</p>
                <p className="text-xl font-bold text-amber-700">{(analytics.commissions?.total || 0).toLocaleString()} ETB</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Company Balance</p>
                <p className="text-xl font-bold text-blue-700">{(analytics.companyBalance || 0).toLocaleString()} ETB</p>
                <p className="text-xs text-gray-400">{analytics.newUsers || 0} new users</p>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Salary Management */}
        {monthlySalaries.length > 0 && (
          <div className="p-6 mb-8 bg-white border border-gray-200 shadow-sm rounded-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-600" /> Pending Monthly Salaries
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase border-b">
                    <th className="pb-2">User</th>
                    <th className="pb-2">Direct Refs</th>
                    <th className="pb-2">Team</th>
                    <th className="pb-2">Salary Due</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthlySalaries.map((u: any) => (
                    <tr key={u._id}>
                      <td className="py-2.5">
                        <p className="font-medium text-gray-900">{u.fullName}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </td>
                      <td className="py-2.5 text-gray-700">{u.directReferrals}</td>
                      <td className="py-2.5 text-gray-700">{u.totalTeamSize}</td>
                      <td className="py-2.5 font-semibold text-green-700">{u.monthlyBalance.toLocaleString()} ETB</td>
                      <td className="py-2.5">
                        <button
                          onClick={() => paySalary(u._id)}
                          disabled={payingSalaryId === u._id}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {payingSalaryId === u._id ? 'Paying...' : 'Pay Salary'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <Link
            to="/admin/users"
            className="p-6 transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">View and manage user accounts</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/transactions"
            className="p-6 transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Transactions</h3>
                <p className="text-sm text-gray-600">Review deposits and withdrawals</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/videos"
            className="p-6 transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Videos</h3>
                <p className="text-sm text-gray-600">Upload videos & view stats</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Transactions */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
                <Link
                  to="/admin/transactions"
                  className="flex items-center space-x-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  <span>View All</span>
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {stats.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'deposit' ? (
                            <ArrowDownRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {transaction.type}
                          </p>
                          <p className="text-sm text-gray-600">
                            {transaction.user?.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}
                          {transaction.amount.toLocaleString()} ETB
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No recent transactions</p>
              </div>
            )}
          </div>

          {/* Recent Users */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Users</h2>
                <Link
                  to="/admin/users"
                  className="flex items-center space-x-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  <span>View All</span>
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {stats?.recentUsers && stats.recentUsers.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {stats.recentUsers.map((user) => (
                  <div key={user.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.fullName}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {user.totalDeposits.toLocaleString()} ETB
                        </p>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleUserStatusToggle(user.id, user.isActive)}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            {user.isActive ? (
                              <UserX className="w-4 h-4 text-red-600" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No recent users</p>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="mt-8 space-y-4">
          {(stats?.pendingDeposits || 0) > 0 && (
            <div className="flex items-center p-4 space-x-3 border border-yellow-200 rounded-lg bg-yellow-50">
              <AlertCircle className="flex-shrink-0 w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  {stats?.pendingDeposits} pending deposits require review
                </p>
                <Link
                  to="/admin/transactions"
                  className="text-sm text-yellow-700 underline hover:text-yellow-800"
                >
                  Review now
                </Link>
              </div>
            </div>
          )}

          {(stats?.pendingWithdrawals || 0) > 0 && (
            <div className="flex items-center p-4 space-x-3 border border-orange-200 rounded-lg bg-orange-50">
              <Clock className="flex-shrink-0 w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">
                  {stats?.pendingWithdrawals} withdrawal requests awaiting approval
                </p>
                <Link
                  to="/admin/transactions"
                  className="text-sm text-orange-700 underline hover:text-orange-800"
                >
                  Process now
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}