'use client';

import { Apple, Camera, TrendingUp, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Apple className="w-20 h-20 text-green-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">CalorieFit</h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            "Take control of your nutrition, one meal at a time. Track calories, achieve your goals, and transform your health journey."
          </p>
          <Link
            href="/auth"
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition-all shadow-lg"
          >
            Get Started
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-2xl shadow-md text-center">
            <Camera className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Easy Tracking</h3>
            <p className="text-gray-600">Log your meals quickly with our smart food search</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-md text-center">
            <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Track Progress</h3>
            <p className="text-gray-600">Monitor your daily and monthly nutrition trends</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-md text-center">
            <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Achieve Goals</h3>
            <p className="text-gray-600">Set personalized targets for bulk or cut</p>
          </div>
        </div>
      </div>
    </div>
  );
}