// ============================================================
// FILE: backend/models/User.js
// PURPOSE: Mongoose schema & model for the User collection
// ============================================================
// A Mongoose "model" is a JavaScript class that maps to a
// MongoDB collection. Each instance of the model = one document
// (i.e. one row in the database).
//
// This model handles:
//   1. Defining what a User document looks like (schema)
//   2. Hashing passwords before saving (pre-save hook)
//   3. Checking passwords at login (instance method)
// ============================================================

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

// ── Schema Definition ─────────────────────────────────────────
// A schema is a blueprint — it describes the shape of documents
// stored in the "users" MongoDB collection.

const userSchema = new mongoose.Schema(
  {
    // Full display name of the user (e.g. "Jane Doe")
    name: {
      type:     String,
      required: [true, 'Name is required'], // Custom error message
      trim:     true,                        // Remove leading/trailing spaces
    },

    // Email address — used as login identifier, must be unique
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,           // MongoDB creates a unique index automatically
      lowercase: true,           // Always store emails in lowercase
      trim:      true,
      match: [
        /^\S+@\S+\.\S+$/,        // Basic email format validation regex
        'Please enter a valid email address',
      ],
    },

    // Hashed password — NEVER store plain-text passwords!
    // The hashing happens in the pre-save hook below.
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },

    // URL or path to the user's profile picture
    // Defaults to empty string (no avatar set yet)
    avatar: {
      type:    String,
      default: '',
    },

    // When the account was created — set automatically
    createdAt: {
      type:    Date,
      default: Date.now, // Date.now is called at insert time (no parentheses!)
    },
  },
  {
    // Mongoose adds `createdAt` and `updatedAt` fields automatically.
    // We already defined createdAt above, but timestamps: true also
    // gives us `updatedAt` which is very useful for tracking changes.
    timestamps: true,
  }
);

// ── Pre-Save Hook: Password Hashing ──────────────────────────
// This function runs BEFORE every save() call on a User document.
// We only re-hash the password if it was actually changed —
// otherwise updating the name/email would needlessly re-hash it.

userSchema.pre('save', async function (next) {
  // `this` refers to the current User document being saved

  // isModified('password') returns true only when the password field
  // has been changed (new user OR password change request)
  if (!this.isModified('password')) {
    return next(); // Skip hashing — password hasn't changed
  }

  try {
    // bcrypt.genSalt(rounds) generates a random "salt"
    // A salt is random data added to the password before hashing
    // to prevent rainbow table attacks. 12 rounds is a good balance
    // between security and performance.
    const salt = await bcrypt.genSalt(12);

    // bcrypt.hash() combines the plain-text password with the salt
    // and produces an irreversible hash string
    this.password = await bcrypt.hash(this.password, salt);

    next(); // Tell Mongoose to continue with the save operation
  } catch (error) {
    next(error); // Pass any error to Mongoose's error handler
  }
});

// ── Instance Method: comparePassword ──────────────────────────
// We add custom methods to the schema to use on User documents.
// This method lets us verify a login attempt.

userSchema.methods.comparePassword = async function (candidatePassword) {
  // bcrypt.compare() hashes the candidate and checks it against
  // the stored hash. Returns true if they match, false otherwise.
  // We NEVER decrypt — bcrypt is a one-way hash.
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Model Creation ─────────────────────────────────────────────
// mongoose.model('User', userSchema) creates the model AND
// maps it to a MongoDB collection called "users" (lowercased + pluralized)

const User = mongoose.model('User', userSchema);

module.exports = User;
