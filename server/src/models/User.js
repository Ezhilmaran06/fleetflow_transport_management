const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  role: {
    type: String,
    required: true,
    enum: [
      'ADMIN',
      'FLEET_MANAGER',
      'DISPATCHER',
      'DRIVER',
      'OPERATIONS_MANAGER',
      'FINANCE_MANAGER',
      'SAFETY_MANAGER'
    ],
    default: 'DISPATCHER'
  },
  roleRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE',
    index: true
  },
  lastLogin: { type: Date },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

module.exports = mongoose.model('User', userSchema);
