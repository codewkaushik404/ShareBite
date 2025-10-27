const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      //Make this field unique only for documents where it actually exists.
      /*
      MongoDB also treats null or missing values as equal when enforcing uniqueness.
      and you insert multiple users without a googleId you’ll get a duplicate key error
      cuz of null/missing values treated as same
      */
      sparse: true,
      required: function(){
        return this.provider === "google"
      }
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function(){
        return this.provider === "local"
      },
      minlength: 6,
    },
    photo: {
      type: String
    },
    provider: {
      type: String,
      enum: ["local","google"],
      default: "local"
    }
  },
  { timestamps: true }
);

// Hash password before save if modified/new
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Helper method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
