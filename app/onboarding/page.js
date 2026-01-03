'use client';

import { useState } from 'react';
import { Apple } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Harris-Benedict BMR Calculator
const calculateBMR = (weight, height, age, gender) => {
  if (gender === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
};

const calculateDailyCalories = (bmr, goal) => {
  const activityFactor = 1.55; // Moderate activity
  const maintenanceCalories = bmr * activityFactor;

  if (goal === 'cut') {
    return Math.round(maintenanceCalories - 500);
  } else if (goal === 'bulk') {
    return Math.round(maintenanceCalories + 300);
  }
  return Math.round(maintenanceCalories);
};

const calculateMacros = (calories) => {
  return {
    protein: Math.round((calories * 0.30) / 4),
    carbs: Math.round((calories * 0.40) / 4),
    fats: Math.round((calories * 0.30) / 9),
  };
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    goal: 'maintain',
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 67,
  });

  const handleNext = () => {
    if (step === 1) {
      if (!data.name || !data.age || !data.weight || !data.height) {
        setError('Please fill all fields');
        return;
      }

      const bmr = calculateBMR(
        parseFloat(data.weight),
        parseFloat(data.height),
        parseFloat(data.age),
        data.gender
      );

      const calories = calculateDailyCalories(bmr, data.goal);
      const macros = calculateMacros(calories);

      setData({
        ...data,
        calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fats: macros.fats,
      });

      setStep(2);
      setError('');
    } else if (step === 2) {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      // Update user profile
      const profileResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          age: parseFloat(data.age),
          weight: parseFloat(data.weight),
          height: parseFloat(data.height),
          gender: data.gender,
        }),
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to update profile');
      }

      // Create goal
      const goalResponse = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `${data.goal.charAt(0).toUpperCase() + data.goal.slice(1)} Goal`,
          targetCalories: data.calories,
          targetProtein: data.protein,
          targetCarbs: data.carbs,
          targetFats: data.fats,
          isActive: true,
        }),
      });

      if (!goalResponse.ok) {
        throw new Error('Failed to create goal');
      }

      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full">
        <div className="flex justify-center mb-6">
          <Apple className="w-16 h-16 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-center mb-2">Let's Set Up Your Profile</h2>
        <p className="text-center text-gray-600 mb-8">Step {step} of 2</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Age"
                value={data.age}
                onChange={(e) => setData({ ...data, age: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select
                value={data.gender}
                onChange={(e) => setData({ ...data, gender: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Weight (kg)"
                value={data.weight}
                onChange={(e) => setData({ ...data, weight: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="Height (cm)"
                value={data.height}
                onChange={(e) => setData({ ...data, height: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Goal</label>
              <div className="grid grid-cols-3 gap-4">
                {['cut', 'maintain', 'bulk'].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setData({ ...data, goal })}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      data.goal === goal
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {goal.charAt(0).toUpperCase() + goal.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-4">
              Based on your details, here are your recommended daily targets. You can adjust them:
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Calories</label>
                <input
                  type="number"
                  value={data.calories}
                  onChange={(e) => setData({ ...data, calories: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={data.protein}
                  onChange={(e) => setData({ ...data, protein: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={data.carbs}
                  onChange={(e) => setData({ ...data, carbs: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Fats (g)</label>
                <input
                  type="number"
                  value={data.fats}
                  onChange={(e) => setData({ ...data, fats: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(1)}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Setting up...' : (step === 1 ? 'Next' : 'Complete Setup')}
          </button>
        </div>
      </div>
    </div>
  );
}