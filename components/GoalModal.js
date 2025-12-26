import { useState, useEffect } from 'react';
import { X, Target, Check, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function GoalModal({ activeGoal, onClose, onSuccess }) {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetCalories: '',
    targetProtein: '',
    targetCarbs: '',
    targetFats: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/goals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoals(response.data.data);
    } catch (err) {
      console.error('Error fetching goals:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.targetCalories || !formData.targetProtein || 
        !formData.targetCarbs || !formData.targetFats) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/goals',
        {
          ...formData,
          targetCalories: parseFloat(formData.targetCalories),
          targetProtein: parseFloat(formData.targetProtein),
          targetCarbs: parseFloat(formData.targetCarbs),
          targetFats: parseFloat(formData.targetFats),
          isActive: goals.length === 0, // First goal is automatically active
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchGoals();
      setShowForm(false);
      setFormData({
        name: '',
        targetCalories: '',
        targetProtein: '',
        targetCarbs: '',
        targetFats: '',
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const setActiveGoal = async (goalId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/goals/${goalId}`,
        { isActive: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchGoals();
      onSuccess();
    } catch (err) {
      console.error('Error setting active goal:', err);
    }
  };

  const deleteGoal = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/goals/${goalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchGoals();
      onSuccess();
    } catch (err) {
      console.error('Error deleting goal:', err);
      alert('Failed to delete goal');
    }
  };

  // Preset templates
  const templates = [
    {
      name: 'Weight Loss',
      targetCalories: 1800,
      targetProtein: 140,
      targetCarbs: 150,
      targetFats: 60,
    },
    {
      name: 'Muscle Gain',
      targetCalories: 2800,
      targetProtein: 200,
      targetCarbs: 350,
      targetFats: 80,
    },
    {
      name: 'Maintenance',
      targetCalories: 2200,
      targetProtein: 165,
      targetCarbs: 250,
      targetFats: 70,
    },
  ];

  const applyTemplate = (template) => {
    setFormData(template);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Manage Goals</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {!showForm ? (
            <>
              {/* Existing Goals */}
              <div className="space-y-3 mb-6">
                {goals.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600">No goals yet. Create your first goal!</p>
                  </div>
                ) : (
                  goals.map((goal) => (
                    <div
                      key={goal._id}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        goal.isActive
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {goal.name}
                            </h3>
                            {goal.isActive && (
                              <span className="px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                                <Check size={12} />
                                Active
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="font-bold text-gray-900">{goal.targetCalories}</div>
                              <div className="text-gray-600">Calories</div>
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{goal.targetProtein}g</div>
                              <div className="text-gray-600">Protein</div>
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{goal.targetCarbs}g</div>
                              <div className="text-gray-600">Carbs</div>
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{goal.targetFats}g</div>
                              <div className="text-gray-600">Fats</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          {!goal.isActive && (
                            <button
                              onClick={() => setActiveGoal(goal._id)}
                              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                            >
                              Set Active
                            </button>
                          )}
                          <button
                            onClick={() => deleteGoal(goal._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="w-full btn-primary"
              >
                Create New Goal
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Templates
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.name}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className="p-3 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
                    >
                      <div className="font-semibold text-gray-900">{template.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {template.targetCalories} cal
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Summer Cut, Bulk Season"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Calories
                  </label>
                  <input
                    type="number"
                    value={formData.targetCalories}
                    onChange={(e) => setFormData({ ...formData, targetCalories: e.target.value })}
                    className="input-field"
                    placeholder="2000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Protein (grams)
                  </label>
                  <input
                    type="number"
                    value={formData.targetProtein}
                    onChange={(e) => setFormData({ ...formData, targetProtein: e.target.value })}
                    className="input-field"
                    placeholder="150"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carbs (grams)
                  </label>
                  <input
                    type="number"
                    value={formData.targetCarbs}
                    onChange={(e) => setFormData({ ...formData, targetCarbs: e.target.value })}
                    className="input-field"
                    placeholder="200"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fats (grams)
                  </label>
                  <input
                    type="number"
                    value={formData.targetFats}
                    onChange={(e) => setFormData({ ...formData, targetFats: e.target.value })}
                    className="input-field"
                    placeholder="65"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}