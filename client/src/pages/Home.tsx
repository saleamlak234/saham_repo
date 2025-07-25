import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Award,
  CheckCircle,
  ArrowRight,
  Star,
  Shield,
  Target,
  Zap,
  Crown
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: DollarSign,
      title: 'High Returns',
      description: '15% daily returns on all investment packages',
      color: 'text-green-600'
    },
    {
      icon: Users,
      title: 'MLM System',
      description: 'Earn 15% commission from referrals (8%, 4%, 2%, 1%)',
      color: 'text-blue-600'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Advanced security measures to protect your investments',
      color: 'text-purple-600'
    },
    {
      icon: Zap,
      title: 'Instant Payouts',
      description: 'Quick withdrawal processing with multiple payment options',
      color: 'text-orange-600'
    }
  ];

  const packages = [
    {
      name: '7th package',
      price: 192000,

      // quarterlyWithdraw: true,
      popular: false
    },
    {
      name: '6th package',
      price: 96000,
      // monthlyReturn: 7000,
      // quarterlyWithdraw: true,
      popular: false
    },
    {
      nameKey: '5th package',
      price: 48000,
      // monthlyReturn: 3500,
      // quarterlyWithdraw: true,
      popular: false
    },
    {
      name: '4th package',
      price: 24000,
      // monthlyReturn: 1400,
      // quarterlyWithdraw: true,
      popular: false
    },
    {
      name: '3rd package',
      price: 12000,
      // monthlyReturn: 1400,
      // quarterlyWithdraw: true,
      popular: false
    },
    {
      name: '2nd package',
      price: 6000,
      // monthlyReturn: 1400,
      // quarterlyWithdraw: true,
      popular: true
    },
    {
      name: '1st package',
      price: 3000,
      // monthlyReturn: 1400,
      // quarterlyWithdraw: true,

      popular: false
    }
  ];

  const vipLevels = [
    { level: 1, badge: 'Bronze', referrals: 10, bonus: 10000, color: 'from-orange-400 to-orange-600' },
    { level: 2, badge: 'Silver', referrals: 20, bonus: 20000, color: 'from-gray-400 to-gray-600' },
    { level: 3, badge: 'Gold', referrals: 30, bonus: 30000, color: 'from-yellow-400 to-yellow-600' },
    { level: 4, badge: 'Platinum', referrals: 40, bonus: 40000, color: 'from-purple-400 to-purple-600' }
  ];

  const translations = {
    am: {
      vipTitle: 'የVIP ደረጃዎች',
      vipSubtitle: 'በኢትዮጵያ ውስጥ ተጨማሪ ገቢ ለማግኘት የሚያስችል የVIP ደረጃ መረጃ',
      directReferrals: 'ቀጥታ ግብዣ',
      monthlyBonus: 'ወርሃዊ ገቢ',
      birr: 'ብር',
      teamBonus: 'የቡድን ጉርሻ',
      members: 'አባላት'
    },
    ti: {
      vipTitle: 'VIP ደረጃታት',
      vipSubtitle: 'ብኢትዮጵያ ውስጢ ተወሳኺ ኣታዊ ንምርካብ ዝሕግዝ VIP ደረጃ ሓበሬታ',
      directReferrals: 'ቀጥታዊ ዓድማት',
      monthlyBonus: 'ወርሓዊ ጉርሻ',
      birr: 'ብር',
      teamBonus: 'ናይ ጉጅለ ጉርሻ',
      members: 'ኣባላት'
    },
    or: {
      vipTitle: 'Sadarkaalee VIP',
      vipSubtitle: 'Itoophiyaa keessatti galii dabalataa argachuuf gargaaru odeeffannoo sadarkaa VIP',
      directReferrals: 'Afeerraa kallattii',
      monthlyBonus: 'Badhaasa ji\'aa',
      birr: 'birr',
      teamBonus: 'Badhaasa garee',
      members: 'miseensota'
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-4 py-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-6xl animate-fade-in">
              Welcome to <span className="text-gold-400">Saham Trading</span>
            </h1>
            <p className="max-w-3xl mx-auto mb-8 text-xl md:text-2xl text-primary-100 animate-slide-up">
              Join Ethiopia's leading stock market investment platform with guaranteed returns 
              and powerful MLM earning opportunities
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 mb-12 sm:flex-row">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="flex items-center px-8 py-4 space-x-2 text-lg font-semibold text-black transition-all transform rounded-lg bg-gold-500 hover:bg-gold-600 hover:scale-105"
                  >
                    <span>Start Investing Today</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 text-lg font-semibold text-white transition-all border-2 border-white rounded-lg hover:bg-white hover:text-primary-900"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="flex items-center px-8 py-4 space-x-2 text-lg font-semibold text-black transition-all transform rounded-lg bg-gold-500 hover:bg-gold-600 hover:scale-105"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid max-w-4xl grid-cols-1 gap-8 mx-auto md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-gold-400">15 %</div>
                <div className="text-primary-200"> daily Returns</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-gold-400">15%</div>
                <div className="text-primary-200">Referral Commission</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-gold-400">1000+</div>
                <div className="text-primary-200">Active Investors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Why Choose Saham Trading?
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              We offer the most comprehensive investment platform with guaranteed returns 
              and multiple earning opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center transition-all duration-300 group hover:transform hover:scale-105">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 ${feature.color} mb-4 group-hover:bg-primary-50`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Investment Packages */}
      <section className="py-20 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Investment Packages
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Choose the package that fits your investment goals. All packages offer 15% daily returns
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {packages.map((pkg, index) => (
              <div key={index} className={`relative bg-white rounded-2xl shadow-lg p-6 border-2 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105 ${pkg.popular ? 'border-gold-400' : 'border-gray-200'}`}>
                {pkg.popular && (
                  <div className="absolute transform -translate-x-1/2 -top-3 left-1/2">
                    <span className="px-4 py-1 text-sm font-semibold text-black rounded-full bg-gold-500">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">{pkg.name}</h3>
                  <div className="mb-1 text-3xl font-bold text-primary-600">
                    {pkg.price.toLocaleString()} ETB
                  </div>
                  <div className="mb-6 text-sm text-gray-500">Initial Investment</div>
                  
    

                  <ul className="mb-6 space-y-2">
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      15% daily Returns
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      daily Withdrawals
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      MLM Commission Eligible
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      24/7 Support
                    </li>
                  </ul>

                  {!user ? (
                    <Link
                      to="/register"
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                        pkg.popular
                          ? 'bg-gold-500 hover:bg-gold-600 text-black'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      Get Started
                    </Link>
                  ) : (
                    <Link
                      to="/deposits"
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                        pkg.popular
                          ? 'bg-gold-500 hover:bg-gold-600 text-black'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      Invest Now
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIP Levels Section */}
      <section className="py-20 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="flex items-center justify-center mb-4 space-x-2">
              <Crown className="w-8 h-8 text-gold-500" />
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
                VIP Levels & Bonuses
              </h2>
            </div>
            
            {/* Multi-language VIP descriptions */}
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="p-6 rounded-lg bg-gradient-to-r from-gold-50 to-gold-100">
                <h3 className="mb-4 text-xl font-bold text-gold-900">{translations.am.vipTitle}</h3>
                <p className="text-gold-800">{translations.am.vipSubtitle}</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-blue-50">
                  <h4 className="mb-2 font-semibold text-blue-900">{translations.ti.vipTitle}</h4>
                  <p className="text-sm text-blue-800">{translations.ti.vipSubtitle}</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50">
                  <h4 className="mb-2 font-semibold text-green-900">{translations.or.vipTitle}</h4>
                  <p className="text-sm text-green-800">{translations.or.vipSubtitle}</p>
                </div>
              </div>
            </div>
          </div>

          {/* VIP Level Cards */}
          <div className="grid grid-cols-1 gap-8 mb-12 md:grid-cols-2 lg:grid-cols-4">
            {vipLevels.map((vip, index) => (
              <div key={index} className="p-6 transition-all duration-300 bg-white border-2 border-gray-200 shadow-lg rounded-2xl hover:shadow-xl">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${vip.color} mb-4`}>
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    Level {vip.level} - {vip.badge}
                  </h3>
                  
                  <div className="mb-6 space-y-3">
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-600">{translations.am.directReferrals}</p>
                      <p className="text-lg font-bold text-gray-900">{vip.referrals} ሰው</p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-green-50">
                      <p className="text-sm text-green-700">{translations.am.monthlyBonus}</p>
                      <p className="text-xl font-bold text-green-800">
                        {vip.bonus.toLocaleString()} {translations.am.birr}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-gray-500">
                    <p>ትግርኛ: {vip.referrals} ቀጥታዊ ዓድማት</p>
                    <p>ኦሮምኛ: {vip.referrals} afeerraa kallattii</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Team Group Bonuses */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="p-8 border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="mb-2 text-2xl font-bold text-blue-900">500 {translations.am.members}</h3>
                <p className="mb-2 text-3xl font-bold text-blue-800">100,000 {translations.am.birr}</p>
                <p className="text-blue-700">{translations.am.teamBonus} / ወር</p>
                
                <div className="mt-4 space-y-1 text-sm">
                  <p className="text-blue-600">ትግርኛ: 500 ኣባላት = 100,000 ብር</p>
                  <p className="text-blue-600">ኦሮምኛ: 500 miseensota = 100,000 birr</p>
                </div>
              </div>
            </div>

            <div className="p-8 border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <h3 className="mb-2 text-2xl font-bold text-purple-900">1000 {translations.am.members}</h3>
                <p className="mb-2 text-3xl font-bold text-purple-800">200,000 {translations.am.birr}</p>
                <p className="text-purple-700">{translations.am.teamBonus} / ወር</p>
                
                <div className="mt-4 space-y-1 text-sm">
                  <p className="text-purple-600">ትግርኛ: 1000 ኣባላት = 200,000 ብር</p>
                  <p className="text-purple-600">ኦሮምኛ: 1000 miseensota = 200,000 birr</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MLM Commission Structure */}
      <section className="py-20 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              MLM Commission Structure
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Earn from every person you refer and their referrals too. 
              Build your network and maximize your earnings.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="p-6 mb-4 text-white bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
                <div className="mb-2 text-3xl font-bold">8%</div>
                <div className="text-blue-100">Level 1</div>
              </div>
              <h3 className="font-semibold text-gray-900">Direct Referrals</h3>
              <p className="text-sm text-gray-600">People you directly invite</p>
            </div>

            <div className="text-center">
              <div className="p-6 mb-4 text-white bg-gradient-to-br from-green-500 to-green-600 rounded-2xl">
                <div className="mb-2 text-3xl font-bold">4%</div>
                <div className="text-green-100">Level 2</div>
              </div>
              <h3 className="font-semibold text-gray-900">2nd Level</h3>
              <p className="text-sm text-gray-600">People your referrals invite</p>
            </div>

            <div className="text-center">
              <div className="p-6 mb-4 text-white bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl">
                <div className="mb-2 text-3xl font-bold">2%</div>
                <div className="text-purple-100">Level 3</div>
              </div>
              <h3 className="font-semibold text-gray-900">3rd Level</h3>
              <p className="text-sm text-gray-600">Third level down your chain</p>
            </div>

            <div className="text-center">
              <div className="p-6 mb-4 text-white bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl">
                <div className="mb-2 text-3xl font-bold">1%</div>
                <div className="text-orange-100">Level 4</div>
              </div>
              <h3 className="font-semibold text-gray-900">4th Level</h3>
              <p className="text-sm text-gray-600">Fourth level down your chain</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="max-w-2xl p-8 mx-auto bg-gradient-to-r from-gold-100 to-gold-50 rounded-2xl">
              <Award className="w-12 h-12 mx-auto mb-4 text-gold-600" />
              <h3 className="mb-2 text-2xl font-bold text-gray-900">Total Commission: 15%</h3>
              <p className="text-gray-600">
                Every time someone in your network makes a deposit or earns, 
                you get your share of the commission automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-white bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to Start Building Wealth?
          </h2>
          <p className="mb-8 text-xl text-primary-100">
            Join thousands of successful investors who are already earning with Saham Trading. 
            Start with any package and begin your journey to financial freedom.
          </p>
          
          {!user ? (
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/register"
                className="flex items-center justify-center px-8 py-4 space-x-2 text-lg font-semibold text-black transition-all transform rounded-lg bg-gold-500 hover:bg-gold-600 hover:scale-105"
              >
                <span>Start Investing Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 text-lg font-semibold text-white transition-all border-2 border-white rounded-lg hover:bg-white hover:text-primary-900"
              >
                Login to Account
              </Link>
            </div>
          ) : (
            <Link
              to="/dashboard"
              className="inline-flex items-center px-8 py-4 space-x-2 text-lg font-semibold text-black transition-all transform rounded-lg bg-gold-500 hover:bg-gold-600 hover:scale-105"
            >
              <span>View Your Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}