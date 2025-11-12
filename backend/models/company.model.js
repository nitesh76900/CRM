const mongoose = require('mongoose');
const crypto = require('crypto');
const secretKey = Buffer.from(process.env.CRYPTO_SECRET, 'hex'); // Ensure it's a Buffer
const iv = Buffer.from(process.env.CRYPTO_IV, 'hex'); // Ensure it's 16 bytes
const algorithm = 'aes-256-cbc';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [3, 'Company name must be at least 3 characters long'],
    },
    phoneNo: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: [true, "Phone number must be unique"],
      match: [/^\d{10,15}$/, 'Phone number must be between 10 to 15 digits'],
    },
    email: {
      type: String, 
      required: [true, 'Email is required'], 
      unique: [true, "Email must be unique"],
      trim: true,
      lowercase: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    image: {
      public_id: { type: String, required: [true, 'Image public_id is required'] },
      url: { type: String, required: [true, 'Image URL is required'] },
    },
    address: {
      country: { type: String, required: [true, 'Country is required'] },
      state: { type: String, required: [true, 'State is required'] },
      city: { type: String, required: [true, 'City is required'] },
      pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        match: [/^\d{4,10}$/, 'Pincode must be between 4 to 10 digits'],
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    verify: {
      type: String,
      enum: ['Pending', 'Verify', 'Rejected'],
      default: 'Pending',
    },
    verifyBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    nodemailerCredential: {
      email: { type: String, select: false }, // Not selected by default
      appPassword: { type: String, select: false }, // Encrypted
    },
    attendanceBy: {
      type: String,
      enum: ["Self", "AssignedEmp"],
      default: "AssignedEmp",
      select: false
    },
    attendanceCheckBy: {
      location: {
        enable: {
          type: Boolean,
          default: false,
          select: false
        },
        value: {
          lat: {
            type: Number,
            select: false
          },
          long: {
            type: Number,
            select: false
          }
        }
      }, 
      networkIp: {
        enable: {
          type: Boolean,
          default: false,
          select: false
        },
        value: {
          type: String,
          select: false
        }
      }
    }
  },
  { timestamps: true }
);

// Encryption function
function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Decryption function
function decrypt(text) {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(text, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Pre-save hook to encrypt appPassword
companySchema.pre('save', function (next) {
  if (this.nodemailerCredential && this.isModified('nodemailerCredential.appPassword')) {
    this.nodemailerCredential.appPassword = encrypt(this.nodemailerCredential.appPassword);
  }
  next();
});

// Method to decrypt credentials
companySchema.methods.decryptCredentials = function () {
  return {
    email: this.nodemailerCredential.email,
    appPassword: decrypt(this.nodemailerCredential.appPassword),
  };
};

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
