import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a goal name'],
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  targetCalories: {
    type: Number,
    required: [true, 'Please provide target calories'],
    min: [0, 'Calories cannot be negative'],
  },
  targetProtein: {
    type: Number,
    required: [true, 'Please provide target protein'],
    min: [0, 'Protein cannot be negative'],
  },
  targetCarbs: {
    type: Number,
    required: [true, 'Please provide target carbs'],
    min: [0, 'Carbs cannot be negative'],
  },
  targetFats: {
    type: Number,
    required: [true, 'Please provide target fats'],
    min: [0, 'Fats cannot be negative'],
  },
  isActive: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Ensure only one active goal per user
GoalSchema.pre('save', async function(next) {
  if (this.isActive) {
    await mongoose.models.Goal.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema);