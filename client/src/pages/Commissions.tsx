import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Award, 
  Users, 
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';

interface Commission {
  id: string;
  amount: number;
  level: number;
  fromUser: {
    id: string;
    fullName: string;
    email: string;
  };
  type: 'deposit' | 'earning';
  description: string;
  createdAt: string;
}

interface CommissionStats {
  totalCommissions: number;
  monthlyCommissions: number;
  level1Commissions: number;
  level2Commissions: number;
  level3Commissions: number;
  level4Commissions: number;
  recentCommissions: Commission[];
}

export default function Commissions() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    fetchCommissionData();
  }, [selectedPeriod]);

  const fetchCommissionData = async () => {
    try {
      const [statsResponse, commissionsResponse] = await Promise.all([
        axios.get('/commissions/stats'),
        axios.get(`/commissions?period=${selectedPeriod}`)
      ]);
      
      setStats(statsResponse.data);
      setCommissions(commissionsResponse.data.commissions);
    } catch (error) {
      console.error('Failed to fetch commission data:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Commission Earnings</h1>
          <p className="text-gray-600 mt-1">Track your MLM commission earnings and referral network</p>
        </div>

        {/* Commission Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Commissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalCommissions || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="bg-gold-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-gold-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">All time earnings</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.monthlyCommissions || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600">Current month earnings</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Direct Referrals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.directReferrals || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-600">Level 1 team members</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Network</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.totalTeamSize || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <User className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-600">All levels combined</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Commission Breakdown */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Commission Breakdown</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">Level 1 (8%)</p>
                      <p className="text-sm text-gray-600">Direct referrals</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {(stats?.level1Commissions || 0).toLocaleString()} ETB
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">Level 2 (4%)</p>
                      <p className="text-sm text-gray-600">2nd level referrals</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {(stats?.level2Commissions || 0).toLocaleString()} ETB
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">Level 3 (2%)</p>
                      <p className="text-sm text-gray-600">3rd level referrals</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {(stats?.level3Commissions || 0).toLocaleString()} ETB
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">Level 4 (1%)</p>
                      <p className="text-sm text-gray-600">4th level referrals</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {(stats?.level4Commissions || 0).toLocaleString()} ETB
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-gold-50 to-gold-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gold-800">Total Earned</span>
                  <span className="text-xl font-bold text-gold-900">
                    {(stats?.totalCommissions || 0).toLocaleString()} ETB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Commission History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Commission History</h3>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Time</option>
                    <option value="month">This Month</option>
                    <option value="week">This Week</option>
                    <option value="today">Today</option>
                  </select>
                </div>
              </div>

              {commissions.length > 0 ? (
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {commissions.map((commission) => (
                    <div key={commission.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-primary-100 p-2 rounded-full">
                            <Award className="h-5 w-5 text-primary-600" />
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
                          <p className="text-xs text-gray-500 capitalize">
                            {commission.type}
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
                    Start referring people to earn commissions from their investments
                  </p>
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4">
                    <p className="text-primary-800 font-medium mb-2">Your Referral Code:</p>
                    <p className="font-mono text-lg font-bold text-primary-600">
                      {user?.referralCode}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How Commissions Work */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-8">
          <h3 className="text-xl font-bold text-primary-900 mb-4">How Commission System Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-primary-800 mb-2">Commission Structure</h4>
              <ul className="space-y-2 text-primary-700">
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Level 1 (Direct): 8% commission</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Level 2: 4% commission</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Level 3: 2% commission</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Level 4: 1% commission</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary-800 mb-2">When You Earn</h4>
              <ul className="space-y-2 text-primary-700">
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>When someone you referred makes a deposit</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>When your network members earn monthly returns</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Commissions are paid instantly</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>No limits on earnings potential</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}