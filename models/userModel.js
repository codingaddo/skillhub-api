const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const validator = require("validator");
const { type } = require("os");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
  },
  email: {
    type: String,
    required: [true, "User email is required"],
    unique: [true, "Email already exist"],
    validate: [validator.isEmail, "Invalid email"],
    lowercase: true,
  },
  phone: {
    type: String,
    unique: [true, "phone number already exist"],
    required: [true, "phone number is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [4, "Password must be at least  characters"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Confirm password is required"],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: "Passwords do not match",
    },
  },
  role: {
    type: String,
    enum: ["client", "artesan", "admin"],
    default: "client",
  },

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  avatar: {
    type: String,
    default: "default.jpg",
  },
});

//Enerypting password before saving to database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined; //Clear the confirmation password
  next();
});

///Setting the password changetAt field
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//Comparing incoming password withe exiting one in db
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// create password reset token and send to the requested user
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //   console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
