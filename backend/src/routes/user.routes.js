const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { upload } = require('../services/upload.service');

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticate,
  userController.getUserProfile
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  [
    body('firstName').optional().isString().withMessage('First name must be a string'),
    body('lastName').optional().isString().withMessage('Last name must be a string'),
    body('email').optional().isEmail().withMessage('Valid email is required')
  ],
  userController.updateUserProfile
);

/**
 * @route   PUT /api/users/profile-picture
 * @desc    Update user profile picture
 * @access  Private
 */
router.put(
  '/profile-picture',
  authenticate,
  upload.single('profileImage'),
  [
    body('imageUrl').optional().isString().withMessage('Image URL must be a string if provided')
  ],
  userController.updateProfilePicture
);

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put(
  '/preferences',
  authenticate,
  [
    body('preferences').notEmpty().withMessage('Preferences are required')
  ],
  userController.updatePreferences
);

/**
 * @route   GET /api/users/ride-stats
 * @desc    Get user ride statistics
 * @access  Private
 */
router.get(
  '/ride-stats',
  authenticate,
  userController.getRideStats
);

module.exports = router; 