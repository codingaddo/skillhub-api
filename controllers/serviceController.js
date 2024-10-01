const Service = require("../models/serviceModel");
const Business = require("../models/businessModel");

module.exports.createService = async (req, res) => {
  try {
    const { category, skill, images } = req.body;
    const businessId = req.params.businessId;

    // Create a new service instance
    const service = await Service.create({
      category,
      skill,
      images,
      business: businessId,
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
