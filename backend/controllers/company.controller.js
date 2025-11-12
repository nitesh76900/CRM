const Company = require("../models/company.model");
const {
  deleteOnCloudinary,
  uploadOnCloudinary,
} = require("../utils/cloudinary");
const emptyTempFolder = require("../utils/emptyTempFolder");
const nodemailer = require("nodemailer");

// ✅ Fetch All Verified & Active Companies
exports.getCompanies = async (req, res) => {
  try {
    // 🔹 Find companies where `verify` is "Verify" and `isActive` is `true`
    const companies = await Company.find(
      { verify: "Verify", isActive: true },
      { name: 1, owner: 1 } // Select only `name` and `owner`
    ).populate("owner"); // Populate only owner's name

    // 🔹 Check if there are any matching companies
    if (companies.length === 0) {
      return res
        .status(404)
        .json({ message: "No verified and active companies found" });
    }

    return res.status(200).json({
      message: "Verified and active companies fetched successfully",
      data: companies,
    });
  } catch (error) {
    console.error("Fetch Verified & Active Companies Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const userId = req.user._id; // Assuming user ID is extracted from auth middleware
    const companyId = req.user.company;
    const { name, phoneNo, email, industry, address } = req.body;

    // Find the company
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Check if the logged-in user is the owner
    if (!company.owner.equals(userId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this company" });
    }

    // Update fields if provided
    if (name) company.name = name;
    if (phoneNo) company.phoneNo = phoneNo;
    if (email) company.email = email;
    if (industry) company.industry = industry;
    if (address) company.address = { ...company.address, ...address };

    // Handle image update if a new image is provided
    if (req.file) {
      // Delete old image from Cloudinary
      if (company.image.public_id) {
        await deleteOnCloudinary(company.image.public_id);
      }

      // Upload new image
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
      if (cloudinaryResponse) {
        company.image = {
          public_id: cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
        };
      }
    }

    // Save updated company details
    await company.save();
    return res
      .status(200)
      .json({ message: "Company updated successfully", company });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await emptyTempFolder();
  }
};

// exports.changeOwner = async (req, res) =>{

// }

exports.updateNodemailerCredentials = async (req, res) => {
  try {
    const { email, appPassword } = req.body;
    const companyId = req.user.company

    // Validate request body
    if (!email || !appPassword) {
      return res.status(400).json({ message: 'Email and app password are required' });
    }

    // Create transport with user credentials
    const testTransport = nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST,
      port: process.env.NODEMAILER_PORT,
      secure: true,
      auth: {
        user: email,
        pass: appPassword,
      },
    });

    try {
      await testTransport.verify(); // Verify user credentials
      console.log("User-provided email and app password verified.");
    } catch (error) {
      console.log("Invalid user credentials.");
      return res.status(400).json({ message: 'Send email credentials are Invalid'});
    }

    // Find and update company
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.nodemailerCredential = { email, appPassword }
    await company.save()

    return res.status(200).json({ message: 'Send email credentials updated successfully' });
  } catch (error) {
    console.error('Error updating nodemailer credentials:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getNodemailerCredentials = async (req, res) => {
  try {
    const companyId = req.user.company;

    // Find the company and explicitly select nodemailerCredential
    const company = await Company.findById(companyId).select('+nodemailerCredential.email +nodemailerCredential.appPassword');

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    console.log("company.nodemailerCredential", company.nodemailerCredential)

    // Check if nodemailer credentials exist
    if (!company.nodemailerCredential.email || !company.nodemailerCredential.appPassword) {
      return res.status(404).json({ message: 'Nodemailer credentials not set' });
    }

    // Use the decryptCredentials method from the schema
    const decryptedCredentials = company.decryptCredentials();

    return res.status(200).json({ message: 'Send mail credentials retrieved successfully', credentials: decryptedCredentials });
  } catch (error) {
    console.error('Error fetching nodemailer credentials:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
