import mongoose from 'mongoose';

const FoodItemSchema = new mongoose.Schema({
  foodName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    default: 'grams',
  },
  calories: {
    type: Number,
    required: true,
  },
  protein: {
    type: Number,
    required: true,
  },
  carbs: {
    type: Number,
    required: true,
  },
  fats: {
    type: Number,
    required: true,
  },
  spoonacularId: {
    type: Number,
  },
});

const MealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mealName: {
    type: String,
    required: [true, 'Please provide a meal name'],
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: [true, 'Please provide a meal type'],
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  foodItems: [FoodItemSchema],
  totalCalories: {
    type: Number,
    default: 0,
  },
  totalProtein: {
    type: Number,
    default: 0,
  },
  totalCarbs: {
    type: Number,
    default: 0,
  },
  totalFats: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Calculate totals before saving
MealSchema.pre('save', function(next) {
  this.totalCalories = this.foodItems.reduce((sum, item) => sum + item.calories, 0);
  this.totalProtein = this.foodItems.reduce((sum, item) => sum + item.protein, 0);
  this.totalCarbs = this.foodItems.reduce((sum, item) => sum + item.carbs, 0);
  this.totalFats = this.foodItems.reduce((sum, item) => sum + item.fats, 0);
  next();
});

export default mongoose.models.Meal || mongoose.model('Meal', MealSchema);