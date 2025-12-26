import { useState } from 'react';
import { X, Search, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function AddMealModal({ onClose, onSuccess }) {
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [foodItems, setFoodItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/foods/search?query=${encodeURIComponent(searchQuery)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSearchResults(response.data.data);
        if (response.data.data.length === 0) {
          setError('No foods found. Try a different search term.');
        }
      }
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const addFoodItem = (food) => {
    const newItem = {
      foodName: food.name,
      amount: 100,
      unit: 'grams',
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      carbsPer100g: food.carbsPer100g,
      fatsPer100g: food.fatsPer100g,
      calories: food.caloriesPer100g,
      protein: food.proteinPer100g,
      carbs: food.carbsPer100g,
      fats: food.fatsPer100g,
    };

    setFoodItems([...foodItems, newItem]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateFoodAmount = (index, amount) => {
    const updated = [...foodItems];
    const factor = amount / 100;
    
    updated[index] = {
      ...updated[index],
      amount,
      calories: updated[index].caloriesPer100g * factor,
      protein: updated[index].proteinPer100g * factor,
      carbs: updated[index].carbsPer100g * factor,
      fats: updated[index].fatsPer100g * factor,
    };

    setFoodItems(updated);
  };

  const removeFoodItem = (index) => {
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!mealName.trim()) {
      setError('Please enter a meal name');
      return;
    }

    if (foodItems.length === 0) {
      setError('Please add at least one food item');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/meals',
        {
          mealName,
          mealType,
          foodItems: foodItems.map(item => ({
            foodName: item.foodName,
            amount: item.amount,
            unit: item.unit,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fats: item.fats,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add meal');
      console.error('Add meal error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalNutrition = foodItems.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fats: acc.fats + item.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Add Meal</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meal Name
              </label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="input-field"
                placeholder="e.g., Grilled Chicken Salad"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meal Type
              </label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="input-field"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
          </div>

          {/* Food Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Food
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                className="input-field"
                placeholder="e.g., chicken, rice, banana"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="btn-primary px-6 disabled:opacity-50"
              >
                <Search size={20} />
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map((food, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addFoodItem(food)}
                    className="w-full px-4 py-3 hover:bg-gray-50 flex justify-between items-center border-b border-gray-100 last:border-0"
                  >
                    <span className="font-medium">{food.name}</span>
                    <span className="text-sm text-gray-600">
                      {food.caloriesPer100g.toFixed(0)} cal/100g
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Added Food Items */}
          {foodItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Food Items</h3>
              <div className="space-y-3">
                {foodItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.foodName}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {item.calories.toFixed(0)} cal | {item.protein.toFixed(1)}g protein
                      </div>
                    </div>
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => updateFoodAmount(idx, parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                      min="1"
                    />
                    <span className="text-sm text-gray-600">grams</span>
                    <button
                      type="button"
                      onClick={() => removeFoodItem(idx)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total Nutrition */}
              <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Total Nutrition</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-lg font-bold text-primary-600">
                      {totalNutrition.calories.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-600">Calories</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {totalNutrition.protein.toFixed(1)}g
                    </div>
                    <div className="text-xs text-gray-600">Protein</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {totalNutrition.carbs.toFixed(1)}g
                    </div>
                    <div className="text-xs text-gray-600">Carbs</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-600">
                      {totalNutrition.fats.toFixed(1)}g
                    </div>
                    <div className="text-xs text-gray-600">Fats</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}