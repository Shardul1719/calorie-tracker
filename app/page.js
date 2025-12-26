'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-red-400 mb-16">
          <h1 className="text-5xl font-bold mb-4">CalorieTracker</h1>
          <p className="text-xl text-primary-100">
            Track your meals, hit your goals, transform your health
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-black">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Track Nutrition</h3>
            <p className="text-primary-100">
              Monitor calories, protein, carbs, and fats for every meal
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-black">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Set Goals</h3>
            <p className="text-primary-100">
              Create custom daily nutrition targets and track progress
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-black">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold mb-2">View Insights</h3>
            <p className="text-primary-100">
              Visualize your nutrition data with charts and reports
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push('/register')}
            className="bg-red-400 text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors"
          >
            Get Started
          </button>
          <button
            onClick={() => router.push('/login')}
            className="bg-transparent border-2 border-white text-black px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}