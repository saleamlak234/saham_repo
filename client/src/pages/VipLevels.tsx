import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Crown, Users, TrendingUp, Award, Star, Trophy } from 'lucide-react';
import VipLevelCard from '../components/VipLevelCard';
import { getTranslation } from '../utils/translations';
import axios from 'axios';

interface VipStats {
  vipLevel: number;
  vipBadge: string;
  vipMonthlyBonus: number;
  teamGroupBonus: number;
  directReferrals: number;
  totalTeamSize: number;
  totalVipEarnings: number;
  monthlyVipEarnings: number;
  nextLevelRequirement: any;
}

export default function VipLevels() {
  const { user } = useAuth();
  const [vipStats, setVipStats] = useState<VipStats | null>(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('am');

  useEffect(() => {
    fetchVipData();
  }, []);

  const fetchVipData = async () => {
    try {
      const [statsResponse, leaderboardResponse] = await Promise.all([
        axios.get('/vip/stats'),
        axios.get('/vip/leaderboard')
      ]);
      
      setVipStats(statsResponse.data);
      setLeaderboard(leaderboardResponse.data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch VIP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const vipLevels = [
    { level: 1, badge: 'bronze', monthlyBonus: 10000, requiredReferrals: 10 },
    { level: 2, badge: 'silver', monthlyBonus: 20000, requiredReferrals: 20 },
    { level: 3, badge: 'gold', monthlyBonus: 30000, requiredReferrals: 30 },
    { level: 4, badge: 'platinum', monthlyBonus: 40000, requiredReferrals: 40 }
  ];

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'bronze': return <Award className="h-5 w-5 text-orange-600" />;
      case 'silver': return <Star className="h-5 w-5 text-gray-500" />;
      case 'gold': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'platinum': return <Crown className="h-5 w-5 text-purple-600" />;
      default: return <Users className="h-5 w-5 text-gray-400" />;
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Crown className="h-8 w-8 text-gold-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              {getTranslation('vipLevels', language)}
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            በኢትዮጵያ ውስጥ ተጨማሪ ገቢ ለማግኘት የሚያስችል የVIP ደረጃ መረጃ
          </p>
          
          {/* Language Selector */}
          <div className="flex justify-center space-x-2 mt-4">
            {[
              { code: 'am', name: 'አማርኛ' },
              { code: 'ti', name: 'ትግርኛ' },
              { code: 'or', name: 'ኦሮምኛ' },
              { code: 'en', name: 'English' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  language === lang.code
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Current VIP Status */}
        {vipStats && (
          <div className="bg-gradient-to-r from-gold-50 to-gold-100 rounded-xl p-6 mb-8 border border-gold-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gold-200 p-3 rounded-full">
                  {getBadgeIcon(vipStats.vipBadge)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gold-900">
                    {vipStats.vipLevel > 0 
                      ? `${getTranslation('vipLevel', language)} ${vipStats.vipLevel} - ${getTranslation(vipStats.vipBadge, language)}`
                      : 'No VIP Level Yet'
                    }
                  </h3>
                  <p className="text-gold-700">
                    {getTranslation('directReferrals', language)}: {vipStats.directReferrals}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gold-900">
                  {(vipStats.vipMonthlyBonus + vipStats.teamGroupBonus).toLocaleString()} {getTranslation('birr', language)}
                </p>
                <p className="text-gold-700">{getTranslation('monthlyBonus', language)}</p>
              </div>
            </div>
          </div>
        )}

        {/* VIP Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {vipLevels.map((level) => (
            <VipLevelCard
              key={level.level}
              level={level.level}
              badge={level.badge}
              monthlyBonus={level.monthlyBonus}
              directReferrals={vipStats?.directReferrals || 0}
              requiredReferrals={level.requiredReferrals}
              language={language}
              isCurrentLevel={vipStats?.vipLevel === level.level}
            />
          ))}
        </div>

        {/* Team Group Bonuses */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Users className="h-6 w-6 text-primary-600" />
            <span>የቡድን ጉርሻዎች (Team Group Bonuses)</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-blue-900">500 {getTranslation('members', language)}</h4>
                  <p className="text-blue-700">{getTranslation('teamBonus500', language)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900">100,000</p>
                  <p className="text-blue-700">{getTranslation('birr', language)}/{getTranslation('month', language)}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${Math.min((vipStats?.totalTeamSize || 0) / 500 * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  {vipStats?.totalTeamSize || 0} / 500 {getTranslation('members', language)}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-purple-900">1000 {getTranslation('members', language)}</h4>
                  <p className="text-purple-700">{getTranslation('teamBonus1000', language)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-900">200,000</p>
                  <p className="text-purple-700">{getTranslation('birr', language)}/{getTranslation('month', language)}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-purple-600"
                    style={{ width: `${Math.min((vipStats?.totalTeamSize || 0) / 1000 * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-purple-600 mt-1">
                  {vipStats?.totalTeamSize || 0} / 1000 {getTranslation('members', language)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* VIP Leaderboard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-gold-500" />
              <span>VIP Leaderboard</span>
            </h3>
          </div>

          {leaderboard.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {leaderboard.slice(0, 10).map((leader: any, index) => (
                <div key={leader._id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-gold-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-gray-300 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getBadgeIcon(leader.vipBadge)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{leader.fullName}</h4>
                        <p className="text-sm text-gray-600">
                          {getTranslation('vipLevel', language)} {leader.vipLevel} - {getTranslation(leader.vipBadge, language)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {leader.directReferrals} {getTranslation('directReferrals', language)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {leader.totalTeamSize} {getTranslation('teamSize', language)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No VIP members yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}