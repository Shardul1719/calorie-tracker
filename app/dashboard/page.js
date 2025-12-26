'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import GoalProgress from '@/components/GoalProgress';
import MealList from '@/components/MealList';
import AddMealModal from '@/components/AddMealModal';
import GoalModal from '@/components/GoalModal';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeGoal, setActiveGoal] = useState(null);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchData(token);
  }, [router]);

  const fetchData = async (token) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch today's stats
      const today = new Date().toISOString().split('T')[0];
      const statsRes = await axios.get(`/api/meals/stats?date=${today}`, { headers });
      setStats(statsRes.data.data);

      // Fetch active goal
      const goalsRes = await axios.get('/api/goals', { headers });
      const active = goalsRes.data.data.find(g => g.isActive);
      setActiveGoal(active);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const refreshData = () => {
    const token = localStorage.getItem('token');
    fetchData(token);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-400 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-400">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Goal Progress */}
        <GoalProgress 
          stats={stats} 
          goal={activeGoal}
          onManageGoals={() => setShowGoalModal(true)}
        />

        {/* Meals Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Today's Meals</h2>
            <button
              onClick={() => setShowAddMeal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Add Meal
            </button>
          </div>

          <MealList meals={stats?.meals || []} onUpdate={refreshData} />
        </div>
      </div>

      {/* Modals */}
      {showAddMeal && (
        <AddMealModal
          onClose={() => setShowAddMeal(false)}
          onSuccess={refreshData}
        />
      )}

      {showGoalModal && (
        <GoalModal
          activeGoal={activeGoal}
          onClose={() => setShowGoalModal(false)}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
}