const Service = require("../models/serviceModel");
const Business = require("../models/businessModel");
const multer = require("multer");
const path = require("path");

// module.exports.createService = async (req, res) => {
//   try {
//     const { category, skill, images } = req.body;
//     const businessId = req.params.businessId;

//     // Create a new service instance
//     const service = await Service.create({
//       category,
//       skill,
//       images,
//       business: businessId,
//     });

//     res.status(201).json(service);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports.createService = async (req, res) => {
//   try {
//     const { category, skill, images } = req.body;
//     const businessId = req.params.businessId;

//     // Create a new service instance
//     const service = await Service.create({
//       category,
//       skill,
//       images,
//       business: businessId,
//     });

//     // Find the business and push the service ID into the services array
//     const business = await Business.findById(businessId);
//     if (!business) {
//       return res.status(404).json({ error: "Business not found" });
//     }

//     business.services.push(service._id);
//     await business.save();

//     res.status(201).json(service);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define the destination folder for saving the images
    cb(null, path.join(__dirname, "../uploads/images"));
  },
  filename: (req, file, cb) => {
    // Set a unique file name with the original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
  },
});

// Set up multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
}).array("images", 5); // Handle multiple images, up to 5 files

// Create service controller
module.exports.createService = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { category, skill } = req.body;
      const businessId = req.params.businessId;
      const serviceOwner = req.user._id;

      // Process the uploaded images and construct the image URLs
      const imageUrls = req.files.map((file) => {
        return `/uploads/images/${file.filename}`; // Assuming you'll serve this directory statically
      });

      // Create a new service instance
      const service = await Service.create({
        category,
        skill,
        images: imageUrls,
        business: businessId,
        owner: serviceOwner, // Set the owner of the service as the authenticated user
      });

      // Find the business and push the service ID into the services array
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
  });
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

// Get Service by ID
exports.getService = async (req, res, next) => {
  try {
    const { id } = req.params; // Get the service ID from the request parameters

    // Find the service by ID and populate the associated business
    const service = await Service.findById(id).populate("business");

    // If no service found, return a 404 error
    if (!service) {
      return res.status(404).json({
        status: "fail",
        message: "Service not found",
      });
    }

    // Return the found service
    res.status(200).json({
      status: "success",
      data: {
        service,
      },
    });
  } catch (err) {
    // Handle any errors (e.g., invalid ID format, database issues)
    res.status(500).json({
      status: "fail",
      message: err.message || "Server Error",
    });
  }
};
