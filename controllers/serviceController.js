const Service = require("../models/serviceModel");
const Business = require("../models/businessModel");
var admin = require("firebase-admin");
var path = require("path");

var serviceAccount = require("../models/db/admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://skill-hub-fd319.appspot.com'
});

const bucket = admin.storage().bucket();

module.exports.createService = async (req, res) => {
  try {
    const { category, skill } = req.body;
    const businessId = req.params.businessId;
    const serviceOwner = req.user._id;

    // Check if files are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images provided" });
    }

    const imageUrls = [];

    // Loop through each uploaded file and upload to Firebase Storage
    for (const file of req.files) {
      const filename = `${businessId}-${path.parse(file.originalname).name}-${Date.now()}${path.extname(file.originalname)}`;

      // Upload file to Firebase Storage
      const uploadToFirebase = await bucket.upload(file.path, {
        destination: `uploads/images/${filename}`,
        public: true,
        metadata: {
          contentType: file.mimetype,
        },
      });

      // Get public URL of the uploaded file
      const fileUrl = uploadToFirebase[0].metadata.mediaLink;
      imageUrls.push(fileUrl);
    }

    // Create a new service instance with uploaded image URLs
    const service = await Service.create({
      category,
      skill,
      images: imageUrls,
      business: businessId,
      owner: serviceOwner,
    });

    // Find the business and add the service ID to its services array
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    business.services.push(service._id);
    await business.save();

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


    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const business = await Business.findById(service.business);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (String(business.owner) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this service" });
    }

    await Service.findByIdAndDelete(serviceId);

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


    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }


    await Service.findByIdAndDelete(serviceId);

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


exports.getService = async (req, res, next) => {
  try {
    const { id } = req.params;


    const service = await Service.findById(id).populate("business");


    if (!service) {
      return res.status(404).json({
        status: "fail",
        message: "Service not found",
      });
    }


    res.status(200).json({
      status: "success",
      data: {
        service,
      },
    });
  } catch (err) {

    res.status(500).json({
      status: "fail",
      message: err.message || "Server Error",
    });
  }
};