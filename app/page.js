'use client';

import {
  Apple,
  Camera,
  TrendingUp,
  BarChart3,
  Sparkles,
  Target,
  Heart
} from 'lucide-react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute -bottom-8 left-1/2 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div
            className={`flex justify-center mb-6 transition-all duration-1000 transform ${
              isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
            }`}
          >
            <div className="relative animate-bounce">
              <Apple className="w-20 h-20 text-green-600 drop-shadow-lg" />
              <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>

          <h1
            className={`text-6xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 transition-all duration-1000 delay-200 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            CalorieFit
          </h1>

          <p
            className={`text-xl text-gray-700 mb-8 max-w-2xl mx-auto transition-all duration-1000 delay-300 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            Take control of your nutrition, one meal at a time. Track calories,
            achieve your goals, and transform your health journey.
          </p>

          {/* GET STARTED BUTTON */}
          <button
            onClick={() => router.push('/dashboard')}
            className={`group inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            Get Started
            <Target className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Quote Section */}
        <div
          className={`max-w-4xl mx-auto mb-20 transition-all duration-1000 delay-500 transform ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <div className="relative bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Heart className="w-8 h-8 text-red-500 fill-red-500 animate-pulse" />
            </div>
            <blockquote className="text-center">
              <p className="text-2xl font-semibold text-gray-800 italic mb-3">
                "Your body is a reflection of your lifestyle. Make every calorie
                count."
              </p>
              <footer className="text-gray-600 font-medium">
                — Start Your Transformation Today
              </footer>
            </blockquote>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2
            className={`text-4xl font-bold text-center text-gray-900 mb-12 transition-all duration-1000 delay-600 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            Why Choose CalorieFit?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: 'Easy Tracking',
                description:
                  'Log your meals quickly with our smart food search and intuitive interface',
                delay: '700ms',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: TrendingUp,
                title: 'Track Progress',
                description:
                  'Monitor your daily and monthly nutrition trends with beautiful visualizations',
                delay: '800ms',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: BarChart3,
                title: 'Achieve Goals',
                description:
                  'Set personalized targets for bulk or cut and watch your transformation unfold',
                delay: '900ms',
                color: 'from-orange-500 to-red-500'
              }
            ].map((benefit, index) => (
              <div
                key={index}
                className={`group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: benefit.delay }}
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
                >
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 text-center">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div
          className={`max-w-4xl mx-auto transition-all duration-1000 delay-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 rounded-3xl shadow-2xl text-white text-center">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Transform Your Life?
            </h3>
            <p className="text-lg mb-6 text-green-50">
              Join thousands of users who have already started their journey to a
              healthier lifestyle
            </p>

            {/* START FREE TODAY BUTTON */}
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-white text-green-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-50 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Start Free Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
