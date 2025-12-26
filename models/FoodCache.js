import mongoose from 'mongoose';

const FoodCacheSchema = new mongoose.Schema({
  foodName: {
    type: String,
    required: true,
    index: true,
  },
  spoonacularId: {
    type: Number,
    unique: true,
    sparse: true,
  },
  caloriesPer100g: {
    type: Number,
    required: true,
  },
  proteinPer100g: {
    type: Number,
    required: true,
  },
  carbsPer100g: {
    type: Number,
    required: true,
  },
  fatsPer100g: {
    type: Number,
    required: true,
  },
  apiResponse: {
    type: mongoose.Schema.Types.Mixed,
  },
  hitCount: {
    type: Number,
    default: 1,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient searching
FoodCacheSchema.index({ foodName: 'text' });

export default mongoose.models.FoodCache || mongoose.model('FoodCache', FoodCacheSchema);