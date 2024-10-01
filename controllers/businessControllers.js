const Business = require("../models/businessModel");
const User = require("../models/userModel");

exports.createBusiness = async (req, res) => {
  try {
    const { businessName, description, address, startTime, closeTime } =
      req.body;

    const owner = req.user._id;

    const newBusiness = new Business({
      businessName,
      description,
      address,
      startTime,
      closeTime,
      owner,
    });

    const savedBusiness = await newBusiness.save();
    res.status(201).json(savedBusiness);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getAll = async (req, res) => {
  try {
    const businesses = await Business.find()
      .populate("owner")
      .populate("services");

    if (businesses.length === 0) {
      return res.status(404).json({ message: "No businesses found" });
    }

    res.status(200).json(businesses);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports.getMyBusiness = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const business = await Business.findOne({ owner: ownerId })
      .populate("owner")
      .populate("services");

    if (!business) {
      return res.status(404).json({ error: "No business found for this user" });
    }

    res.status(200).json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateMyBusiness = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const businessId = req.params.businessId;

    const business = await Business.findOneAndUpdate(
      { _id: businessId, owner: ownerId },
      req.body, // Data to update
      { new: true, runValidators: true }
    )
      .populate("owner")
      .populate("services");

    if (!business) {
      return res.status(404).json({ error: "No business found for this user" });
    }

    res.status(200).json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteMyBusiness = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const businessId = req.params.businessId;

    const business = await Business.findOneAndDelete({
      _id: businessId,
      owner: ownerId,
    });

    if (!business) {
      return res.status(404).json({ error: "No business found for this user" });
    }

    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
