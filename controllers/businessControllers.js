const Business = require("../models/businessModel");
const User = require("../models/userModel");

exports.createBusiness = async (req, res) => {
  try {
    const { businessName, description, address, startTime, closeTime } =
      req.body;

    // Extract the owner (user ID) from req.user
    const owner = req.user._id;

    // Create a new business
    const newBusiness = new Business({
      businessName,
      description,
      address,
      startTime,
      closeTime,
      owner, // Owner is the logged-in user
    });

    const savedBusiness = await newBusiness.save();
    res.status(201).json(savedBusiness);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getAll = async (req, res) => {
  try {
    const businesses = await Business.find().populate("owner");

    if (businesses.length === 0) {
      return res.status(404).json({ message: "No businesses found" });
    }

    res.status(200).json(businesses);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};
