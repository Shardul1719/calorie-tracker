// import { useState } from 'react';
// import { Coffee, Sun, Moon, Cookie, Trash2, Edit } from 'lucide-react';
// import axios from 'axios';

// const mealIcons = {
//   breakfast: <Coffee size={24} />,
//   lunch: <Sun size={24} />,
//   dinner: <Moon size={24} />,
//   snack: <Cookie size={24} />,
// };

// const mealColors = {
//   breakfast: 'bg-orange-100 text-orange-700',
//   lunch: 'bg-blue-100 text-blue-700',
//   dinner: 'bg-purple-100 text-purple-700',
//   snack: 'bg-green-100 text-green-700',
// };

// export default function MealList({ meals, onUpdate }) {
//   const [deleting, setDeleting] = useState(null);

//   const handleDelete = async (mealId) => {
//     if (!confirm('Are you sure you want to delete this meal?')) return;

//     setDeleting(mealId);
//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete(`/api/meals/${mealId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       onUpdate();
//     } catch (error) {
//       console.error('Error deleting meal:', error);
//       alert('Failed to delete meal');
//     } finally {
//       setDeleting(null);
//     }
//   };

//   if (!meals || meals.length === 0) {
//     return (
//       <div className="card text-center py-12">
//         <div className="text-6xl mb-4">🍽️</div>
//         <h3 className="text-xl font-semibold text-gray-900 mb-2">
//           No meals logged yet
//         </h3>
//         <p className="text-gray-600">
//           Start tracking by adding your first meal of the day
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {meals.map((meal) => (
//         <div key={meal._id} className="card hover:shadow-md transition-shadow">
//           <div className="flex items-start justify-between">
//             <div className="flex items-start gap-4 flex-1">
//               <div className={`p-3 rounded-lg ${mealColors[meal.mealType]}`}>
//                 {mealIcons[meal.mealType]}
//               </div>

//               <div className="flex-1">
//                 <div className="flex items-center gap-2 mb-1">
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     {meal.mealName}
//                   </h3>
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${mealColors[meal.mealType]}`}>
//                     {meal.mealType}
//                   </span>
//                 </div>

//                 <div className="grid grid-cols-4 gap-4 mt-3">
//                   <div>
//                     <div className="text-2xl font-bold text-primary-600">
//                       {meal.totalCalories.toFixed(0)}
//                     </div>
//                     <div className="text-xs text-gray-600">Calories</div>
//                   </div>
//                   <div>
//                     <div className="text-2xl font-bold text-blue-600">
//                       {meal.totalProtein.toFixed(1)}g
//                     </div>
//                     <div className="text-xs text-gray-600">Protein</div>
//                   </div>
//                   <div>
//                     <div className="text-2xl font-bold text-green-600">
//                       {meal.totalCarbs.toFixed(1)}g
//                     </div>
//                     <div className="text-xs text-gray-600">Carbs</div>
//                   </div>
//                   <div>
//                     <div className="text-2xl font-bold text-yellow-600">
//                       {meal.totalFats.toFixed(1)}g
//                     </div>
//                     <div className="text-xs text-gray-600">Fats</div>
//                   </div>
//                 </div>

//                 <div className="mt-4 pt-4 border-t border-gray-200">
//                   <p className="text-sm font-medium text-gray-700 mb-2">Food Items:</p>
//                   <ul className="space-y-1">
//                     {meal.foodItems.map((item, idx) => (
//                       <li key={idx} className="text-sm text-gray-600 flex justify-between">
//                         <span>{item.foodName}</span>
//                         <span className="text-gray-500">
//                           {item.amount} {item.unit}
//                         </span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </div>

//             <button
//               onClick={() => handleDelete(meal._id)}
//               disabled={deleting === meal._id}
//               className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
//             >
//               <Trash2 size={20} />
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }