'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Apple, Plus, Edit2, Trash2, LogOut, User, TrendingUp, X, Check, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState(null);
  const [meals, setMeals] = useState([]);
  const [dailyStats, setDailyStats] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Meal form states
  const [showMealForm, setShowMealForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [mealForm, setMealForm] = useState({
    mealName: '',
    mealType: 'breakfast',
    foodItems: [],
    searchQuery: '',
    searchResults: [],
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }
    loadUserData();
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, selectedDate]);

  useEffect(() => {
    if (user && activeTab === 'progress') {
      loadMonthlyData();
    }
  }, [user, activeTab]);

  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  };

  const loadUserData = async () => {
    try {
      const userData = await apiCall('/user/profile');
      setUser(userData.data);

      const goalsData = await apiCall('/goals');
      const activeGoal = goalsData.data.find(g => g.isActive);
      setGoals(activeGoal);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load user data:', error);
      localStorage.removeItem('token');
      router.push('/auth');
    }
  };

  const loadDashboardData = async () => {
    try {
      const stats = await apiCall(`/meals/stats?date=${selectedDate}`);
      setDailyStats(stats.data);
      setMeals(stats.data.meals || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadMonthlyData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const data = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        try {
          const stats = await apiCall(`/meals/stats?date=${dateStr}`);
          data.push({
            date: dateStr,
            calories: stats.data.totalCalories,
            protein: stats.data.totalProtein,
            carbs: stats.data.totalCarbs,
            fats: stats.data.totalFats,
          });
        } catch {
          data.push({ date: dateStr, calories: 0, protein: 0, carbs: 0, fats: 0 });
        }
      }
      setMonthlyData(data);
    } catch (error) {
      console.error('Failed to load monthly data:', error);
    }
  };

  const searchFood = async (query) => {
    try {
      const data = await apiCall(`/foods/search?query=${encodeURIComponent(query)}`);
      setMealForm({ ...mealForm, searchResults: data.data || [] });
    } catch (error) {
      console.error('Food search error:', error);
    }
  };

  const addFoodToMeal = (food) => {
    const newFood = {
      foodName: food.name,
      quantity: 100,
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      carbsPer100g: food.carbsPer100g,
      fatsPer100g: food.fatsPer100g,
    };
    setMealForm({
      ...mealForm,
      foodItems: [...mealForm.foodItems, newFood],
      searchQuery: '',
      searchResults: [],
    });
  };

  const updateFoodQuantity = (index, quantity) => {
    const updated = [...mealForm.foodItems];
    updated[index].quantity = parseFloat(quantity) || 0;
    setMealForm({ ...mealForm, foodItems: updated });
  };

  const removeFoodFromMeal = (index) => {
    setMealForm({
      ...mealForm,
      foodItems: mealForm.foodItems.filter((_, i) => i !== index),
    });
  };

  const saveMeal = async () => {
    if (!mealForm.mealName || mealForm.foodItems.length === 0) {
      alert('Please add meal name and at least one food item');
      return;
    }

    try {
      // Transform foodItems to match backend schema
      const transformedFoodItems = mealForm.foodItems.map(item => ({
        foodName: item.foodName,
        amount: item.quantity, // quantity -> amount
        unit: 'grams',
        calories: Math.round((item.quantity / 100) * item.caloriesPer100g),
        protein: Math.round((item.quantity / 100) * item.proteinPer100g),
        carbs: Math.round((item.quantity / 100) * item.carbsPer100g),
        fats: Math.round((item.quantity / 100) * item.fatsPer100g),
      }));

      const mealData = {
        mealName: mealForm.mealName,
        mealType: mealForm.mealType,
        date: selectedDate,
        foodItems: transformedFoodItems,
      };

      if (editingMeal) {
        await apiCall(`/meals/${editingMeal._id}`, {
          method: 'PUT',
          body: JSON.stringify(mealData),
        });
      } else {
        await apiCall('/meals', {
          method: 'POST',
          body: JSON.stringify(mealData),
        });
      }

      setShowMealForm(false);
      setEditingMeal(null);
      setMealForm({
        mealName: '',
        mealType: 'breakfast',
        foodItems: [],
        searchQuery: '',
        searchResults: [],
      });
      setActiveTab('dashboard'); // Go back to dashboard after saving
      loadDashboardData();
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteMeal = async (mealId) => {
    if (!confirm('Delete this meal?')) return;

    try {
      await apiCall(`/meals/${mealId}`, { method: 'DELETE' });
      loadDashboardData();
    } catch (error) {
      alert(error.message);
    }
  };

  const startEditMeal = (meal) => {
    setEditingMeal(meal);
    setMealForm({
      mealName: meal.mealName,
      mealType: meal.mealType,
      foodItems: meal.foodItems,
      searchQuery: '',
      searchResults: [],
    });
    setShowMealForm(true);
    setActiveTab('meals');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const calculateProgress = () => {
    if (!dailyStats || !goals) return { calories: 0, protein: 0, carbs: 0, fats: 0, overall: 0 };

    const caloriesPercent = (dailyStats.totalCalories / goals.targetCalories) * 100;
    const proteinPercent = (dailyStats.totalProtein / goals.targetProtein) * 100;
    const carbsPercent = (dailyStats.totalCarbs / goals.targetCarbs) * 100;
    const fatsPercent = (dailyStats.totalFats / goals.targetFats) * 100;
    const overall = (caloriesPercent + proteinPercent + carbsPercent + fatsPercent) / 4;

    return {
      calories: Math.min(caloriesPercent, 100),
      protein: Math.min(proteinPercent, 100),
      carbs: Math.min(carbsPercent, 100),
      fats: Math.min(fatsPercent, 100),
      overall: Math.min(overall, 100),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Apple className="w-16 h-16 text-green-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const remaining = goals ? {
    calories: goals.targetCalories - (dailyStats?.totalCalories || 0),
    protein: goals.targetProtein - (dailyStats?.totalProtein || 0),
    carbs: goals.targetCarbs - (dailyStats?.totalCarbs || 0),
    fats: goals.targetFats - (dailyStats?.totalFats || 0),
  } : { calories: 0, protein: 0, carbs: 0, fats: 0 };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Apple className="w-8 h-8" />
            CalorieFit
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setShowMealForm(false);
              }}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'dashboard' ? 'bg-white text-green-600' : 'bg-green-700 hover:bg-green-800'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'progress' ? 'bg-white text-green-600' : 'bg-green-700 hover:bg-green-800'
              }`}
            >
              Progress
            </button>
            <button
              onClick={() => {
                setActiveTab('meals');
                setShowMealForm(true);
                setEditingMeal(null);
                setMealForm({
                  mealName: '',
                  mealType: 'breakfast',
                  foodItems: [],
                  searchQuery: '',
                  searchResults: [],
                });
              }}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'meals' ? 'bg-white text-green-600' : 'bg-green-700 hover:bg-green-800'
              }`}
            >
              Add Meal
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'profile' ? 'bg-white text-green-600' : 'bg-green-700 hover:bg-green-800'
              }`}
            >
              Profile
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Date Selector */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() - 1);
                setSelectedDate(date.toISOString().split('T')[0]);
              }}
              className="p-2 rounded-lg bg-white shadow hover:shadow-md transition-all"
            >
              ←
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={() => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() + 1);
                if (date <= new Date()) {
                  setSelectedDate(date.toISOString().split('T')[0]);
                }
              }}
              className="p-2 rounded-lg bg-white shadow hover:shadow-md transition-all"
            >
              →
            </button>
          </div>

          {/* Apple Progress */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <svg width="300" height="300" viewBox="0 0 200 200">
                  <circle cx="100" cy="110" r="80" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="100"
                    cy="110"
                    r="80"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeDasharray={`${(progress.overall / 100) * 502.65} 502.65`}
                    strokeLinecap="round"
                    transform="rotate(-90 100 110)"
                  />
                  <path
                    d="M100,50 Q120,40 130,60 Q145,50 150,70 Q160,100 150,130 Q140,150 120,160 Q110,165 100,165 Q90,165 80,160 Q60,150 50,130 Q40,100 50,70 Q55,50 70,60 Q80,40 100,50 Z"
                    fill={progress.overall >= 80 ? '#10b981' : progress.overall >= 50 ? '#fbbf24' : '#ef4444'}
                    opacity="0.2"
                  />
                  <path d="M100,50 Q95,45 100,40" stroke="#10b981" strokeWidth="3" fill="none" />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold text-gray-800">
                    {Math.round(dailyStats?.totalCalories || 0)}
                  </div>
                  <div className="text-sm text-gray-500">of {goals?.targetCalories || 0}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {remaining.calories > 0 ? `${Math.round(remaining.calories)} left` : 'Goal reached!'}
                  </div>
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-8 w-full max-w-2xl">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Protein</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(dailyStats?.totalProtein || 0)}g
                  </div>
                  <div className="text-xs text-gray-400">of {goals?.targetProtein || 0}g</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress.protein}%` }} />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Carbs</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {Math.round(dailyStats?.totalCarbs || 0)}g
                  </div>
                  <div className="text-xs text-gray-400">of {goals?.targetCarbs || 0}g</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-yellow-600 h-2 rounded-full transition-all" style={{ width: `${progress.carbs}%` }} />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Fats</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(dailyStats?.totalFats || 0)}g
                  </div>
                  <div className="text-xs text-gray-400">of {goals?.targetFats || 0}g</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-orange-600 h-2 rounded-full transition-all" style={{ width: `${progress.fats}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Meals */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Today's Meals</h2>
              <button
                onClick={() => {
                  setShowMealForm(true);
                  setActiveTab('meals');
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Meal
              </button>
            </div>

            {meals.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No meals logged yet. Start tracking your food!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {meals.map((meal) => (
                  <div key={meal._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">
                            {meal.mealType}
                          </span>
                          <h3 className="text-lg font-semibold">{meal.mealName}</h3>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditMeal(meal)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMeal(meal._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Calories:</span>
                        <span className="ml-2 font-semibold">{Math.round(meal.totalCalories)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Protein:</span>
                        <span className="ml-2 font-semibold">{Math.round(meal.totalProtein)}g</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Carbs:</span>
                        <span className="ml-2 font-semibold">{Math.round(meal.totalCarbs)}g</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Fats:</span>
                        <span className="ml-2 font-semibold">{Math.round(meal.totalFats)}g</span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      {meal.foodItems.length} item(s)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Total Meals Today</div>
              <div className="text-3xl font-bold text-gray-800">{meals.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Progress</div>
              <div className="text-3xl font-bold text-green-600">{Math.round(progress.overall)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* PROGRESS TAB
      {activeTab === 'progress' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-8">Your Progress</h2>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-6">Last 30 Days - Calories</h3>
            <div className="h-64 flex items-end justify-between gap-1">
              {monthlyData.slice(-30).map((day, idx) => {
                const height = goals?.targetCalories ? (day.calories / goals.targetCalories) * 100 : 0;
                const isToday = day.date === new Date().toISOString().split('T')[0];

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full rounded-t transition-all ${
                        height >= 100 ? 'bg-green-500' : height >= 80 ? 'bg-yellow-500' : 'bg-gray-300'
                      } ${isToday ? 'ring-2 ring-green-600' : ''}`}
                      style={{ height: `${Math.min(height, 100)}%` }}
                      title={`${day.date}: ${day.calories} cal`}
                    />
                    {idx % 5 === 0 && (
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(day.date).getDate()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-8 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span>100%+ of goal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded" />
                <span>80-100% of goal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded" />
                <span>&lt;80% of goal</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Avg Calories</div>
              <div className="text-2xl font-bold">
                {Math.round(monthlyData.slice(-7).reduce((sum, d) => sum + d.calories, 0) / 7) || 0}
              </div>
              <div className="text-xs text-gray-400">Last 7 days</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Avg Protein</div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(monthlyData.slice(-7).reduce((sum, d) => sum + d.protein, 0) / 7) || 0}g
              </div>
              <div className="text-xs text-gray-400">Last 7 days</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Avg Carbs</div>
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round(monthlyData.slice(-7).reduce((sum, d) => sum + d.carbs, 0) / 7) || 0}g
              </div>
              <div className="text-xs text-gray-400">Last 7 days</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Avg Fats</div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(monthlyData.slice(-7).reduce((sum, d) => sum + d.fats, 0) / 7) || 0}g
              </div>
              <div className="text-xs text-gray-400">Last 7 days</div>
            </div>
          </div>
        </div>
      )} */}
      {/* PROGRESS TAB */}
      {activeTab === 'progress' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-8">Your Progress</h2>

          {/* Debug info - remove after testing */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold mb-2">Debug Info:</p>
            <p className="text-xs">Data points: {monthlyData.length}</p>
            <p className="text-xs">Goal calories: {goals?.targetCalories || 'Not set'}</p>
            {monthlyData.slice(-3).map((day, i) => (
              <p key={i} className="text-xs">
                {day.date}: {day.calories} cal ({Math.round((day.calories / (goals?.targetCalories || 2000)) * 100)}%)
              </p>
            ))}
          </div>

          {/* Calories Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-6">Last 30 Days - Calories</h3>
            
            {monthlyData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No data available yet. Start tracking your meals!</p>
              </div>
            ) : (
              <>
                <div className="relative h-96 bg-gray-50 rounded-lg p-4">
                  {/* Y-axis */}
                  <div className="absolute left-0 top-4 bottom-4 w-12 flex flex-col justify-between text-xs text-gray-600 text-right pr-2">
                    <span>{goals?.targetCalories || 2000}</span>
                    <span>{Math.round((goals?.targetCalories || 2000) * 0.75)}</span>
                    <span>{Math.round((goals?.targetCalories || 2000) * 0.5)}</span>
                    <span>{Math.round((goals?.targetCalories || 2000) * 0.25)}</span>
                    <span>0</span>
                  </div>

                  {/* Chart area */}
                  <div className="ml-14 h-full border-l-2 border-b-2 border-gray-300 relative">
                    {/* Goal line */}
                    <div className="absolute left-0 right-0 top-0 border-t-2 border-dashed border-green-500 opacity-40">
                      <span className="absolute -top-6 right-0 text-xs text-green-600 font-semibold bg-white px-2">Goal</span>
                    </div>

                    {/* Bars */}
                    <div className="h-full flex items-end gap-0.5 px-2">
                      {monthlyData.slice(-30).map((day, idx) => {
                        const targetCals = goals?.targetCalories || 2000;
                        const rawPercentage = (day.calories / targetCals) * 100;
                        // Ensure minimum visibility
                        const displayHeight = day.calories > 0 
                          ? Math.max(rawPercentage, 2) 
                          : 0;
                        const cappedHeight = Math.min(displayHeight, 100);
                        
                        const isToday = day.date === new Date().toISOString().split('T')[0];

                        let barColor = 'bg-gray-300';
                        if (day.calories >= targetCals) barColor = 'bg-green-600';
                        else if (rawPercentage >= 80) barColor = 'bg-green-500';
                        else if (rawPercentage >= 50) barColor = 'bg-yellow-500';
                        else if (day.calories > 0) barColor = 'bg-orange-400';

                        return (
                          <div 
                            key={idx} 
                            className="flex-1 group relative flex flex-col items-stretch justify-end"
                            style={{ minWidth: '8px' }}
                          >
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap z-50 shadow-xl">
                              <div className="font-bold mb-1">
                                {new Date(day.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-green-300">🔥 {Math.round(day.calories)} cal</div>
                              <div className="text-gray-300">📊 {Math.round(rawPercentage)}% of goal</div>
                              <div className="text-blue-300 mt-1">💪 {Math.round(day.protein)}g protein</div>
                              <div className="text-yellow-300">🍞 {Math.round(day.carbs)}g carbs</div>
                              <div className="text-orange-300">🥑 {Math.round(day.fats)}g fats</div>
                            </div>

                            {/* Bar */}
                            <div
                              className={`w-full rounded-t-sm transition-all duration-200 cursor-pointer ${barColor} hover:opacity-80 ${
                                isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                              }`}
                              style={{ 
                                height: `${cappedHeight}%`,
                                minHeight: day.calories > 0 ? '8px' : '0px'
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="ml-14 mt-2 flex justify-between text-xs text-gray-500">
                    {[0, 7, 14, 21, 28].map(offset => {
                      const date = monthlyData.slice(-30)[offset];
                      return date ? (
                        <span key={offset}>
                          {new Date(date.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 mt-6 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-green-600 rounded" />
                    <span>Above goal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-green-500 rounded" />
                    <span>80-100%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-yellow-500 rounded" />
                    <span>50-80%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-orange-400 rounded" />
                    <span>&lt;50%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-blue-500 rounded ring-2 ring-blue-500" />
                    <span>Today</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Macros Charts */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Protein Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-bold text-blue-600 mb-4 text-lg">Protein (Last 7 Days)</h4>
              {monthlyData.length < 7 ? (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                  Track more days to see trends
                </div>
              ) : (
                <>
                  <div className="h-64 bg-blue-50 rounded-lg p-4 flex items-end gap-2">
                    {monthlyData.slice(-7).map((day, idx) => {
                      const target = goals?.targetProtein || 150;
                      const percentage = (day.protein / target) * 100;
                      const height = day.protein > 0 ? Math.max(Math.min(percentage, 100), 3) : 0;
                      
                      return (
                        <div key={idx} className="flex-1 group relative flex flex-col items-center justify-end">
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-50">
                            <div className="font-bold">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            <div className="text-blue-300">{Math.round(day.protein)}g</div>
                            <div className="text-gray-300">{Math.round(percentage)}% of goal</div>
                          </div>

                          {/* Bar */}
                          <div
                            className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-all cursor-pointer"
                            style={{ 
                              height: `${height}%`,
                              minHeight: day.protein > 0 ? '8px' : '0'
                            }}
                          />
                          
                          {/* Label */}
                          <span className="text-xs text-gray-600 font-medium mt-2">
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(monthlyData.slice(-7).reduce((sum, d) => sum + d.protein, 0) / 7)}g
                    </div>
                    <div className="text-xs text-gray-500">avg / day</div>
                  </div>
                </>
              )}
            </div>

            {/* Carbs Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-bold text-yellow-600 mb-4 text-lg">Carbs (Last 7 Days)</h4>
              {monthlyData.length < 7 ? (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                  Track more days to see trends
                </div>
              ) : (
                <>
                  <div className="h-64 bg-yellow-50 rounded-lg p-4 flex items-end gap-2">
                    {monthlyData.slice(-7).map((day, idx) => {
                      const target = goals?.targetCarbs || 200;
                      const percentage = (day.carbs / target) * 100;
                      const height = day.carbs > 0 ? Math.max(Math.min(percentage, 100), 3) : 0;
                      
                      return (
                        <div key={idx} className="flex-1 group relative flex flex-col items-center justify-end">
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-50">
                            <div className="font-bold">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            <div className="text-yellow-300">{Math.round(day.carbs)}g</div>
                            <div className="text-gray-300">{Math.round(percentage)}% of goal</div>
                          </div>

                          <div
                            className="w-full bg-yellow-500 hover:bg-yellow-600 rounded-t transition-all cursor-pointer"
                            style={{ 
                              height: `${height}%`,
                              minHeight: day.carbs > 0 ? '8px' : '0'
                            }}
                          />
                          
                          <span className="text-xs text-gray-600 font-medium mt-2">
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {Math.round(monthlyData.slice(-7).reduce((sum, d) => sum + d.carbs, 0) / 7)}g
                    </div>
                    <div className="text-xs text-gray-500">avg / day</div>
                  </div>
                </>
              )}
            </div>

            {/* Fats Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-bold text-orange-600 mb-4 text-lg">Fats (Last 7 Days)</h4>
              {monthlyData.length < 7 ? (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                  Track more days to see trends
                </div>
              ) : (
                <>
                  <div className="h-64 bg-orange-50 rounded-lg p-4 flex items-end gap-2">
                    {monthlyData.slice(-7).map((day, idx) => {
                      const target = goals?.targetFats || 65;
                      const percentage = (day.fats / target) * 100;
                      const height = day.fats > 0 ? Math.max(Math.min(percentage, 100), 3) : 0;
                      
                      return (
                        <div key={idx} className="flex-1 group relative flex flex-col items-center justify-end">
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-50">
                            <div className="font-bold">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            <div className="text-orange-300">{Math.round(day.fats)}g</div>
                            <div className="text-gray-300">{Math.round(percentage)}% of goal</div>
                          </div>

                          <div
                            className="w-full bg-orange-500 hover:bg-orange-600 rounded-t transition-all cursor-pointer"
                            style={{ 
                              height: `${height}%`,
                              minHeight: day.fats > 0 ? '8px' : '0'
                            }}
                          />
                          
                          <span className="text-xs text-gray-600 font-medium mt-2">
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(monthlyData.slice(-7).reduce((sum, d) => sum + d.fats, 0) / 7)}g
                    </div>
                    <div className="text-xs text-gray-500">avg / day</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border-2 border-green-200">
              <div className="text-sm text-green-700 font-semibold mb-1">Avg Calories</div>
              <div className="text-3xl font-bold text-green-700">
                {Math.round(monthlyData.slice(-7).reduce((sum, d) => sum + d.calories, 0) / 7) || 0}
              </div>
              <div className="text-xs text-green-600 mt-1">Last 7 days</div>
              <div className="mt-2 text-sm">
                <span className={`font-bold ${
                  (monthlyData.slice(-7).reduce((sum, d) => sum + d.calories, 0) / 7) >= (goals?.targetCalories || 0)
                    ? 'text-green-700'
                    : 'text-orange-600'
                }`}>
                  {Math.round(((monthlyData.slice(-7).reduce((sum, d) => sum + d.calories, 0) / 7) / (goals?.targetCalories || 1)) * 100)}%
                </span>
                <span className="text-green-600"> of goal</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border-2 border-blue-200">
              <div className="text-sm text-blue-700 font-semibold mb-1">Avg Protein</div>
              <div className="text-3xl font-bold text-blue-700">
                {Math.round(monthlyData.slice(-7).reduce((sum, d) => sum + d.protein, 0) / 7) || 0}g
              </div>
              <div className="text-xs text-blue-600 mt-1">Last 7 days</div>
              <div className="mt-2 text-sm">
                <span className={`font-bold ${
                  (monthlyData.slice(-7).reduce((sum, d) => sum + d.protein, 0) / 7) >= (goals?.targetProtein || 0)
                    ? 'text-green-700'
                    : 'text-orange-600'
                }`}>
                  {Math.round(((monthlyData.slice(-7).reduce((sum, d) => sum + d.protein, 0) / 7) / (goals?.targetProtein || 1)) * 100)}%
                </span>
                <span className="text-blue-600"> of goal</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-6 border-2 border-yellow-200">
              <div className="text-sm text-yellow-700 font-semibold mb-1">Avg Carbs</div>
              <div className="text-3xl font-bold text-yellow-700">
                {Math.round(monthlyData.slice(-7).reduce((sum, d) => sum + d.carbs, 0) / 7) || 0}g
              </div>
              <div className="text-xs text-yellow-600 mt-1">Last 7 days</div>
              <div className="mt-2 text-sm">
                <span className={`font-bold ${
                  (monthlyData.slice(-7).reduce((sum, d) => sum + d.carbs, 0) / 7) >= (goals?.targetCarbs || 0)
                    ? 'text-green-700'
                    : 'text-orange-600'
                }`}>
                  {Math.round(((monthlyData.slice(-7).reduce((sum, d) => sum + d.carbs, 0) / 7) / (goals?.targetCarbs || 1)) * 100)}%
                </span>
                <span className="text-yellow-600"> of goal</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg p-6 border-2 border-orange-200">
              <div className="text-sm text-orange-700 font-semibold mb-1">Avg Fats</div>
              <div className="text-3xl font-bold text-orange-700">
                {Math.round(monthlyData.slice(-7).reduce((sum, d) => sum + d.fats, 0) / 7) || 0}g
              </div>
              <div className="text-xs text-orange-600 mt-1">Last 7 days</div>
              <div className="mt-2 text-sm">
                <span className={`font-bold ${
                  (monthlyData.slice(-7).reduce((sum, d) => sum + d.fats, 0) / 7) >= (goals?.targetFats || 0)
                    ? 'text-green-700'
                    : 'text-orange-600'
                }`}>
                  {Math.round(((monthlyData.slice(-7).reduce((sum, d) => sum + d.fats, 0) / 7) / (goals?.targetFats || 1)) * 100)}%
                </span>
                <span className="text-orange-600"> of goal</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEALS TAB */}
      {activeTab === 'meals' && showMealForm && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingMeal ? 'Edit Meal' : 'Add New Meal'}
            </h2>

            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Meal Name (e.g., Morning Breakfast)"
                value={mealForm.mealName}
                onChange={(e) => setMealForm({ ...mealForm, mealName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <select
                value={mealForm.mealType}
                onChange={(e) => setMealForm({ ...mealForm, mealType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            {/* Food Search */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search for food..."
                  value={mealForm.searchQuery}
                  onChange={(e) => setMealForm({ ...mealForm, searchQuery: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && searchFood(mealForm.searchQuery)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={() => searchFood(mealForm.searchQuery)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                >
                  Search
                </button>
              </div>

              {mealForm.searchResults.length > 0 && (
                <div className="mt-2 border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                  {mealForm.searchResults.map((food, idx) => (
                    <button
                      key={idx}
                      onClick={() => addFoodToMeal(food)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="font-semibold">{food.name}</div>
                      <div className="text-sm text-gray-500">
                        {food.caloriesPer100g} cal, {food.proteinPer100g}g protein per 100g
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Added Foods */}
            {mealForm.foodItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Food Items</h3>
                <div className="space-y-3">
                  {mealForm.foodItems.map((food, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold">{food.foodName}</div>
                        <div className="text-sm text-gray-500">
                          {Math.round((food.quantity / 100) * food.caloriesPer100g)} cal,
                          {Math.round((food.quantity / 100) * food.proteinPer100g)}g protein
                        </div>
                      </div>
                      <input
                        type="number"
                        value={food.quantity}
                        onChange={(e) => updateFoodQuantity(idx, e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="g"
                      />
                      <button
                        onClick={() => removeFoodFromMeal(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowMealForm(false);
                  setEditingMeal(null);
                  setMealForm({
                    mealName: '',
                    mealType: 'breakfast',
                    foodItems: [],
                    searchQuery: '',
                    searchResults: [],
                  });
                  setActiveTab('dashboard');
                }}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveMeal}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {editingMeal ? 'Update Meal' : 'Save Meal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Age</div>
                <div className="text-xl font-semibold">{user?.age || 'Not set'}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Gender</div>
                <div className="text-xl font-semibold capitalize">{user?.gender || 'Not set'}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Weight</div>
                <div className="text-xl font-semibold">{user?.weight ? `${user.weight} kg` : 'Not set'}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Height</div>
                <div className="text-xl font-semibold">{user?.height ? `${user.height} cm` : 'Not set'}</div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4">Daily Goals</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Calories</div>
                  <div className="text-2xl font-bold text-green-600">{goals?.targetCalories || 0}</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Protein</div>
                  <div className="text-2xl font-bold text-blue-600">{goals?.targetProtein || 0}g</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-gray-600">Carbs</div>
                  <div className="text-2xl font-bold text-yellow-600">{goals?.targetCarbs || 0}g</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-sm text-gray-600">Fats</div>
                  <div className="text-2xl font-bold text-orange-600">{goals?.targetFats || 0}g</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}