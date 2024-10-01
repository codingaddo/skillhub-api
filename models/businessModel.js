// models/Business.js
const mongoose = require("mongoose");
const Service = require("./serviceModel");

const BusinessSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Referencing the User model
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  closeTime: {
    type: String,
    required: true,
  },
  services: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-delete middleware to remove associated services
BusinessSchema.pre("findOneAndDelete", async function (next) {
  const businessId = this.getFilter()._id; // Get the business ID from the filter
  if (businessId) {
    await Service.deleteMany({ business: businessId }); // Delete services with the matching business ID
  }
  next();
});
module.exports = mongoose.model("Business", BusinessSchema);
