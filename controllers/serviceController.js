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

module.exports.verifyService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findByIdAndUpdate(
      serviceId,
      { isVerified: true },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getAllVerifiedServices = async (req, res) => {
  try {
    const services = await Service.find({ isVerified: true });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getAllService = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteServiceByowner = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Find the service by ID
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Optionally, check if the user owns the business the service belongs to (if required)
    const business = await Business.findById(service.business);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Check if the current user is the owner of the business (you can modify this check as needed)
    if (String(business.owner) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this service" });
    }

    // Delete the service
    await Service.findByIdAndDelete(serviceId);

    // Optionally, remove the service reference from the business
    business.services = business.services.filter(
      (id) => String(id) !== String(serviceId)
    );
    await business.save();

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Find the service by ID
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Delete the service
    await Service.findByIdAndDelete(serviceId);

    // Remove the service reference from the business
    const business = await Business.findById(service.business);
    if (business) {
      business.services = business.services.filter(
        (id) => String(id) !== String(serviceId)
      );
      await business.save();
    }

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
