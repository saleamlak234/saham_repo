import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign,
  Clock,
  Package,
  BarChart3,
  ArrowUpRight,
  Users,
  Award,
  Target,
  Zap
} from 'lucide-react';
import axios from 'axios';

interface DailyReturn {
  _id: string;
  amount: number;
  returnPercentage: number;
  date: string;
  deposit: {
    package: string;
    amount: number;
  };
  processedAt: string;
  commissionsDistributed: number;
}

interface DailyReturnsStats {
  totalReturns: number;
  todayReturns: number;
  monthlyReturns: number;
  dailyReturnCommissions: number;
  returnsByPackage: Array<{
    _id: string;
    total: number;
    count: number;
    averageDaily: number;
  }>;
}

interface CommissionData {
  commissionsByLevel: Array<{
    _id: number;
    total: number;
    count: number;
  }>;
  recentCommissions: Array<{
    _id: string;
    amount: number;
    level: number;
    fromUser: {
      fullName: string;
      email: string;
    };
    description: string;
    createdAt: string;
  }>;
}

export default function DailyReturns() {
  const { user } = useAuth();
  const [dailyReturns, setDailyReturns] = useState<DailyReturn[]>([]);
  const [stats, setStats] = useState<DailyReturnsStats | null>(null);
  const [commissionData, setCommissionData] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('returns');

  useEffect(() => {
    fetchDailyReturns();
    fetchStats();
    fetchCommissions();
  }, [selectedPeriod]);

  const fetchDailyReturns = async () => {
    try {
      const response = await axios.get(`/daily-returns?period=${selectedPeriod}`);
      setDailyReturns(response.data.dailyReturns);
    } catch (error) {
      console.error('Failed to fetch daily returns:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/daily-returns/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch daily returns stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommissions = async () => {
    try {
      const response = await axios.get('/daily-returns/commissions');
      setCommissionData(response.data);
    } catch (error) {
      console.error('Failed to fetch commission data:', error);
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-green-100 text-green-800';
      case 3: return 'bg-purple-100 text-purple-800';
      case 4: return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelPercentage = (level: number) => {
    switch (level) {
      case 1: return '8%';
      case 2: return '4%';
      case 3: return '2%';
      case 4: return '1%';
      default: return '0%';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Daily Returns System</h1>
          <p className="text-gray-600 mt-1">
            Track your 15% daily returns and referral commissions (Processed at 00:00 EAT)
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalReturns || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">All time earnings</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Returns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.todayReturns || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-600">Processed at midnight</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.monthlyReturns || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-600">Current month earnings</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Commission Earned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.dailyReturnCommissions || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-orange-600">From referral network</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('returns')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'returns'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Daily Returns
              </button>
              <button
                onClick={() => setActiveTab('commissions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'commissions'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Commission Breakdown
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'returns' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Returns by Package */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Returns by Package</h3>
                
                <div className="space-y-4">
                  {stats?.returnsByPackage?.map((packageReturn, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{packageReturn._id}</p>
                          <p className="text-xs text-gray-600">
                            {packageReturn.count} returns • Avg: {packageReturn.averageDaily?.toLocaleString()} ETB
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {packageReturn.total.toLocaleString()} ETB
                      </p>
                    </div>
                  ))}
                  
                  {(!stats?.returnsByPackage || stats.returnsByPackage.length === 0) && (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No returns yet</p>
                      <p className="text-sm text-gray-400">Make a deposit to start earning daily returns</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Daily Returns History */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Returns History</h3>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>
                </div>

                {dailyReturns.length > 0 ? (
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {dailyReturns.map((dailyReturn) => (
                      <div key={dailyReturn._id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-green-100 p-2 rounded-full">
                              <ArrowUpRight className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Daily Return - {dailyReturn.deposit.package}
                              </h4>
                              <p className="text-sm text-gray-600">
                                15% of {dailyReturn.deposit.amount.toLocaleString()} ETB
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(dailyReturn.date).toLocaleDateString()} • 
                                Processed: {new Date(dailyReturn.processedAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              +{dailyReturn.amount.toLocaleString()} ETB
                            </p>
                            <p className="text-xs text-gray-500">
                              Daily Return (15%)
                            </p>
                            {dailyReturn.commissionsDistributed > 0 && (
                              <p className="text-xs text-purple-600">
                                Commissions: {dailyReturn.commissionsDistributed.toLocaleString()} ETB
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No returns yet</h3>
                    <p className="text-gray-600 mb-6">
                      Daily returns will appear here once you have active deposits
                    </p>
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4">
                      <p className="text-primary-800 font-medium mb-2">How Daily Returns Work:</p>
                      <ul className="text-sm text-primary-700 space-y-1">
                        <li>• 15% daily returns on all investment packages</li>
                        <li>• Returns are processed daily at 00:00 Ethiopian Time</li>
                        <li>• 15% commission distributed to referral network</li>
                        <li>• Returns are automatically added to your balance</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Commission Breakdown Tab */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Commission by Level */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Commission by Level</h3>
                
                <div className="space-y-4">
                  {commissionData?.commissionsByLevel?.map((levelData) => (
                    <div key={levelData._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(levelData._id)}`}>
                          Level {levelData._id}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{getLevelPercentage(levelData._id)}</p>
                          <p className="text-xs text-gray-600">{levelData.count} commissions</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {levelData.total.toLocaleString()} ETB
                      </p>
                    </div>
                  ))}
                  
                  {(!commissionData?.commissionsByLevel || commissionData.commissionsByLevel.length === 0) && (
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No commissions yet</p>
                      <p className="text-sm text-gray-400">Build your referral network to earn commissions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Commissions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Daily Return Commissions</h3>
                </div>

                {commissionData?.recentCommissions && commissionData.recentCommissions.length > 0 ? (
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {commissionData.recentCommissions.map((commission) => (
                      <div key={commission._id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-purple-100 p-2 rounded-full">
                              <Award className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">
                                  Commission from {commission.fromUser.fullName}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(commission.level)}`}>
                                  Level {commission.level} ({getLevelPercentage(commission.level)})
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{commission.description}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(commission.createdAt).toLocaleDateString()} • 
                                {new Date(commission.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              +{commission.amount.toLocaleString()} ETB
                            </p>
                            <p className="text-xs text-gray-500">
                              Daily Return Commission
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No commissions yet</h3>
                    <p className="text-gray-600 mb-6">
                      Start referring people to earn commissions from their daily returns
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* System Information */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-8">
          <h3 className="text-xl font-bold text-blue-900 mb-4">Daily Returns System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Return Processing</h4>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Daily processing at 00:00 Ethiopian Time</span>
                </li>
                <li className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>15% daily return on all packages</span>
                </li>
                <li className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Returns automatically added to balance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Calculated based on original deposit amount</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Commission Distribution (15% Total)</h4>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 bg-blue-500 rounded-full text-xs flex items-center justify-center text-white">1</span>
                    <span>Level 1 (Direct):</span>
                  </span>
                  <span className="font-semibold">8% commission</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 bg-green-500 rounded-full text-xs flex items-center justify-center text-white">2</span>
                    <span>Level 2:</span>
                  </span>
                  <span className="font-semibold">4% commission</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 bg-purple-500 rounded-full text-xs flex items-center justify-center text-white">3</span>
                    <span>Level 3:</span>
                  </span>
                  <span className="font-semibold">2% commission</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 bg-orange-500 rounded-full text-xs flex items-center justify-center text-white">4</span>
                    <span>Level 4:</span>
                  </span>
                  <span className="font-semibold">1% commission</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Example Calculation */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
          <h4 className="font-semibold text-green-800 mb-3">Example: 24,000 ETB Deposit</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-green-700"><strong>Daily Return:</strong> 24,000 × 15% = 3,600 ETB</p>
              <p className="text-green-700"><strong>User Balance:</strong> +3,600 ETB</p>
            </div>
            <div className="space-y-1 text-green-700">
              <p><strong>Commission Distribution:</strong></p>
              <p>• Level 1: 3,600 × 8% = 288 ETB</p>
              <p>• Level 2: 3,600 × 4% = 144 ETB</p>
              <p>• Level 3: 3,600 × 2% = 72 ETB</p>
              <p>• Level 4: 3,600 × 1% = 36 ETB</p>
              <p><strong>Total Distributed: 540 ETB (15%)</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}