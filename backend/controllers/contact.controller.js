const Contacts = require("../models/contact.model");
const { uploadOnCloudinary, deleteOnCloudinary } = require("../utils/cloudinary");
const emptyTempFolder = require("../utils/emptyTempFolder");


// Add Contact
exports.addContact = async (req, res) => {
    try {
        console.log('req.body', req.body)
        const { name, phoneNo, email, address } = req.body;

        if (!name || !phoneNo) {
            return res.status(400).json({ message: "Name and Phone number are required" });
        }

        const existingContact = await Contacts.findOne({ phoneNo, company: req.user.company });
        if (existingContact) {
            return res.status(400).json({ message: "Contact with this email already exists" });
        }

        let image = { public_id: null, url: null }
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (!uploadResult) {
                return res.status(500).json({ message: "Failed to upload business card image" });
            }
            image = { public_id: uploadResult.public_id, url: uploadResult.url }
        }

        const contact = new Contacts({
            name,
            phoneNo,
            email,
            address,
            businessCard: image,
            company: req.user.company,
        });

        await contact.save();
        res.status(201).json({ message: "Contact added successfully", contact });
    } catch (error) {
        console.error("Error adding contact:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    } finally {
        emptyTempFolder()
    }
};

// Update Contact
exports.updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phoneNo, email, address } = req.body;

        const contact = await Contacts.findById(id);
        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        const existingContact = await Contacts.findOne({
            phoneNo,
            company: req.user.company,
            _id: { $ne: id }, // Exclude the current contact
        });
        if (existingContact) {
            return res.status(400).json({ message: "Contact with this email already exists" });
        }

        if (req.file) {
            await deleteOnCloudinary(contact.businessCard.public_id);
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (!uploadResult) {
                return res.status(500).json({ message: "Failed to upload new business card image" });
            }
            contact.businessCard = { public_id: uploadResult.public_id, url: uploadResult.url };
        }

        contact.name = name || contact.name;
        contact.phoneNo = phoneNo || contact.phoneNo;
        contact.email = email || contact.email;
        contact.address = address || contact.address;

        await contact.save();
        res.status(200).json({ message: "Contact updated successfully", contact });
    } catch (error) {
        console.error("Error updating contact:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    } finally {
        emptyTempFolder()
    }
};

// Change Contact to Client
exports.toggleClientStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contacts.findOne({ _id: id, company: req.user.company });
        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        contact.isClient = !contact.isClient;
        await contact.save();

        res.status(200).json({ message: "Contact converted to client", contact });
    } catch (error) {
        console.error("Error converting contact to client:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Get Contacts with Search & Filters
exports.getContacts = async (req, res) => {
    try {
        console.log("Called")
        const { search, isClient, page = 1, limit = 10 } = req.query;
        let filters = { company: req.user.company };

        // Convert isClient to boolean if provided
        if (isClient !== undefined) filters.isClient = isClient === "true";

        // Search functionality: Match `name`, `email`, `phoneNo`, or `address`
        if (search) {
            const regex = new RegExp(search, "i"); // Case-insensitive search
            filters.$or = [
                { name: regex },
                { email: regex },
                { phoneNo: regex },
                { "address.city": regex },
                { "address.state": regex },
                { "address.country": regex },
                { "address.pincode": regex },
            ];
        }

        // Pagination settings
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        // Fetch contacts with applied filters and pagination
        const contacts = await Contacts.find(filters)
            .skip(skip)
            .limit(pageSize);

        if (contacts.length === 0) {
            return res.status(404).json({ message: "No contacts found matching the criteria." });
        }

        // Count total contacts for pagination
        const totalContacts = await Contacts.countDocuments(filters);

        res.status(200).json({
            contacts,
            totalContacts,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalContacts / pageSize),
        });

    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
