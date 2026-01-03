// import { Target, TrendingUp } from 'lucide-react';

// export default function GoalProgress({ stats, goal, onManageGoals }) {
//   if (!goal) {
//     return (
//       <div className="card">
//         <div className="text-center py-8">
//           <Target className="mx-auto text-gray-400 mb-4" size={48} />
//           <h3 className="text-xl font-semibold text-gray-900 mb-2">
//             No Active Goal
//           </h3>
//           <p className="text-gray-600 mb-4">
//             Set a daily nutrition goal to start tracking your progress
//           </p>
//           <button onClick={onManageGoals} className="btn-primary">
//             Create Goal
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const calorieProgress = (stats?.totalCalories || 0) / goal.targetCalories * 100;
//   const proteinProgress = (stats?.totalProtein || 0) / goal.targetProtein * 100;
//   const carbsProgress = (stats?.totalCarbs || 0) / goal.targetCarbs * 100;
//   const fatsProgress = (stats?.totalFats || 0) / goal.targetFats * 100;

//   const ProgressBar = ({ label, current, target, color }) => {
//     const percentage = Math.min((current / target) * 100, 100);
//     const isOver = current > target;

//     return (
//       <div className="mb-4">
//         <div className="flex justify-between items-center mb-2">
//           <span className="text-sm font-medium text-gray-700">{label}</span>
//           <span className={`text-sm font-semibold ${isOver ? 'text-red-600' : 'text-gray-900'}`}>
//             {current.toFixed(1)} / {target}
//             {label !== 'Calories' && 'g'}
//           </span>
//         </div>
//         <div className="w-full bg-gray-200 rounded-full h-3">
//           <div
//             className={`h-3 rounded-full transition-all duration-500 ${
//               isOver ? 'bg-red-500' : color
//             }`}
//             style={{ width: `${percentage}%` }}
//           ></div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="card">
//       <div className="flex justify-between items-start mb-6">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//             <TrendingUp className="text-primary-600" />
//             Today's Progress
//           </h2>
//           <p className="text-gray-600 mt-1">Goal: {goal.name}</p>
//         </div>
//         <button
//           onClick={onManageGoals}
//           className="text-primary-600 hover:text-primary-700 font-medium text-sm"
//         >
//           Manage Goals
//         </button>
//       </div>

//       <div className="grid md:grid-cols-2 gap-6">
//         <div>
//           <ProgressBar
//             label="Calories"
//             current={stats?.totalCalories || 0}
//             target={goal.targetCalories}
//             color="bg-primary-600"
//           />
//           <ProgressBar
//             label="Protein"
//             current={stats?.totalProtein || 0}
//             target={goal.targetProtein}
//             color="bg-blue-500"
//           />
//         </div>
//         <div>
//           <ProgressBar
//             label="Carbs"
//             current={stats?.totalCarbs || 0}
//             target={goal.targetCarbs}
//             color="bg-green-500"
//           />
//           <ProgressBar
//             label="Fats"
//             current={stats?.totalFats || 0}
//             target={goal.targetFats}
//             color="bg-yellow-500"
//           />
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
//         <div className="text-center">
//           <div className="text-2xl font-bold text-primary-600">
//             {((stats?.totalCalories || 0) / goal.targetCalories * 100).toFixed(0)}%
//           </div>
//           <div className="text-xs text-gray-600 mt-1">Calories</div>
//         </div>
//         <div className="text-center">
//           <div className="text-2xl font-bold text-blue-600">
//             {((stats?.totalProtein || 0) / goal.targetProtein * 100).toFixed(0)}%
//           </div>
//           <div className="text-xs text-gray-600 mt-1">Protein</div>
//         </div>
//         <div className="text-center">
//           <div className="text-2xl font-bold text-green-600">
//             {((stats?.totalCarbs || 0) / goal.targetCarbs * 100).toFixed(0)}%
//           </div>
//           <div className="text-xs text-gray-600 mt-1">Carbs</div>
//         </div>
//         <div className="text-center">
//           <div className="text-2xl font-bold text-yellow-600">
//             {((stats?.totalFats || 0) / goal.targetFats * 100).toFixed(0)}%
//           </div>
//           <div className="text-xs text-gray-600 mt-1">Fats</div>
//         </div>
//       </div>
//     </div>
//   );
// }