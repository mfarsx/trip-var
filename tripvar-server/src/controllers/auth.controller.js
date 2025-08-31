const User = require("../models/user.model");
const { ValidationError, UnauthorizedError } = require("../utils/errors");
const { successResponse } = require("../utils/response");
const COUNTRIES = require("../utils/countries");

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, dateOfBirth, nationality } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ValidationError("Email already registered");
    }

    // Format dateOfBirth to handle timezone issues
    const formattedDateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined;

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      dateOfBirth: formattedDateOfBirth,
      nationality
    });

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from output
    user.password = undefined;

    res.status(201).json(
      successResponse(
        {
          user,
          token,
        },
        "User registered successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      throw new ValidationError("Please provide email and password");
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from output
    user.password = undefined;

    res.status(200).json(
      successResponse(
        {
          user,
          token,
        },
        "Login successful"
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .lean();

    // Calculate age if dateOfBirth exists
    if (user.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(user.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      user.age = age;
    }

    // Get country code if nationality exists
    if (user.nationality) {
      const country = COUNTRIES.find(c => c.name === user.nationality);
      if (country) {
        user.countryCode = country.code;
      }
    }

    res.status(200).json(
      successResponse(
        {
          user,
        },
        "Profile retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    // Don't allow password updates here
    if (req.body.password) {
      throw new ValidationError(
        "This route is not for password updates. Please use /auth/update-password"
      );
    }

    // Filter out unwanted fields that are not allowed to be updated
    const filteredBody = filterObj(req.body, "name", "email", "dateOfBirth", "nationality");

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    // Calculate age if dateOfBirth exists
    if (updatedUser.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(updatedUser.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      updatedUser.age = age;
    }

    // Get country code if nationality exists
    if (updatedUser.nationality) {
      const country = COUNTRIES.find(c => c.name === updatedUser.nationality);
      if (country) {
        updatedUser.countryCode = country.code;
      }
    }

    res.status(200).json(
      successResponse(
        {
          user: updatedUser,
        },
        "Profile updated successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

// Update password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ValidationError("Please provide current and new password");
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!(await user.comparePassword(currentPassword))) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = user.generateAuthToken();

    res.status(200).json(
      successResponse(
        {
          token,
        },
        "Password updated successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

// Delete user account
exports.deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json(successResponse(null, "Account deleted successfully"));
  } catch (error) {
    next(error);
  }
};

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(successResponse({ users }));
  } catch (error) {
    next(error);
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    // Clear the token from the client side
    res.status(200).json(successResponse(null, "Logged out successfully"));
  } catch (error) {
    next(error);
  }
};

// Toggle favorite destination
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { destinationId } = req.params;
    
    if (!destinationId) {
      throw new ValidationError("Destination ID is required");
    }
    
    const user = await User.findById(req.user.id);
    
    // Check if the destination is already in favorites
    const isFavorite = user.favorites.includes(destinationId);
    
    if (isFavorite) {
      // Remove from favorites
      user.favorites = user.favorites.filter(id => id.toString() !== destinationId);
    } else {
      // Add to favorites
      user.favorites.push(destinationId);
    }
    
    await user.save();
    
    res.status(200).json(
      successResponse(
        {
          isFavorite: !isFavorite,
          favorites: user.favorites
        },
        `Destination ${isFavorite ? 'removed from' : 'added to'} favorites`
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get user's favorite destinations
exports.getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    
    res.status(200).json(
      successResponse(
        {
          favorites: user.favorites
        },
        "Favorites retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

// Helper function to filter objects
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
