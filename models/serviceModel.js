const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
  },
  skill: {
    type: String,
    required: [true, "Skill is required"],
    trim: true,
  },
  images: {
    type: [String],
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Service", ServiceSchema);
