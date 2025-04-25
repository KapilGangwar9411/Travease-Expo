const { admin, db } = require('../config/firebase');
const { validateUser } = require('../models/user.model');
const { uploadToFirebase } = require('../services/upload.service');

/**
 * Get user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    return res.status(200).json({
      user: {
        id: userId,
        phoneNumber: userData.phoneNumber,
        email: userData.email || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        profileImage: userData.profileImage || '',
        referralCode: userData.referralCode,
        walletBalance: userData.walletBalance || 0,
        rideStats: userData.rideStats || {
          totalRides: 0,
          cancelledRides: 0,
          totalDistance: 0,
          totalFare: 0
        },
        preferences: userData.preferences || {
          notifications: {
            rides: true,
            marketing: true,
            offers: true
          },
          language: 'en',
          darkMode: false
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting user profile:', error);
    return res.status(500).json({ message: 'Error getting user profile', error: error.message });
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email } = req.body;
    
    // Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Update user profile
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    
    // Update user in Firestore
    await db.collection('users').doc(userId).update(updateData);
    
    // Get updated user data
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    return res.status(200).json({
      message: 'User profile updated successfully',
      user: {
        id: userId,
        phoneNumber: userData.phoneNumber,
        email: userData.email || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        profileImage: userData.profileImage || '',
        referralCode: userData.referralCode
      }
    });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
};

/**
 * Update user profile picture
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if there's a file or an imageUrl in the request
    if (!req.file && !req.body.imageUrl) {
      return res.status(400).json({ message: 'Image file or URL is required' });
    }
    
    let imageUrl;
    
    // Handle file upload if a file is provided
    if (req.file) {
      imageUrl = await uploadToFirebase(req.file, userId);
    } else {
      // Use the provided imageUrl if no file is uploaded
      imageUrl = req.body.imageUrl;
    }
    
    // Update user in Firestore
    await db.collection('users').doc(userId).update({
      profileImage: imageUrl,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return res.status(200).json({
      message: 'Profile picture updated successfully',
      profileImage: imageUrl
    });
    
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return res.status(500).json({ message: 'Error updating profile picture', error: error.message });
  }
};

/**
 * Update user preferences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({ message: 'Preferences are required' });
    }
    
    // Get current preferences
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = userDoc.data();
    const currentPreferences = userData.preferences || {
      notifications: {
        rides: true,
        marketing: true,
        offers: true
      },
      language: 'en',
      darkMode: false
    };
    
    // Merge with new preferences
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences,
      notifications: {
        ...currentPreferences.notifications,
        ...(preferences.notifications || {})
      }
    };
    
    // Update user in Firestore
    await db.collection('users').doc(userId).update({
      preferences: updatedPreferences,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return res.status(200).json({
      message: 'Preferences updated successfully',
      preferences: updatedPreferences
    });
    
  } catch (error) {
    console.error('Error updating preferences:', error);
    return res.status(500).json({ message: 'Error updating preferences', error: error.message });
  }
};

/**
 * Get user ride statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRideStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = userDoc.data();
    const baseStats = userData.rideStats || {
      totalRides: 0,
      cancelledRides: 0,
      totalDistance: 0,
      totalFare: 0
    };
    
    // Get additional statistics from rides collection
    const ridesQuery = await db.collection('rides')
      .where('userId', '==', userId)
      .get();
    
    // Calculate detailed statistics
    const rides = [];
    let completedRides = 0;
    let totalDuration = 0;
    let mostFrequentDestination = null;
    let mostFrequentDestinationCount = 0;
    const destinationCounts = {};
    
    ridesQuery.forEach(doc => {
      const ride = doc.data();
      rides.push({
        id: doc.id,
        ...ride
      });
      
      // Count completed rides
      if (ride.status === 'completed') {
        completedRides++;
        
        // Count duration
        if (ride.timestamps && ride.timestamps.completed && ride.timestamps.started) {
          const start = ride.timestamps.started.toDate();
          const end = ride.timestamps.completed.toDate();
          const duration = (end - start) / (1000 * 60); // in minutes
          totalDuration += duration;
        }
        
        // Count destinations
        const destination = ride.destination.location.address;
        if (destination) {
          destinationCounts[destination] = (destinationCounts[destination] || 0) + 1;
          
          if (destinationCounts[destination] > mostFrequentDestinationCount) {
            mostFrequentDestination = destination;
            mostFrequentDestinationCount = destinationCounts[destination];
          }
        }
      }
    });
    
    // Calculate average ride duration
    const avgDuration = completedRides > 0 ? Math.round(totalDuration / completedRides) : 0;
    
    // Enhanced statistics
    const enhancedStats = {
      ...baseStats,
      completedRides,
      cancelledRides: rides.filter(r => r.status === 'cancelled').length,
      avgDuration,
      mostFrequentDestination: mostFrequentDestination || 'None',
      mostFrequentDestinationCount: mostFrequentDestinationCount || 0
    };
    
    return res.status(200).json({
      stats: enhancedStats
    });
    
  } catch (error) {
    console.error('Error getting ride stats:', error);
    return res.status(500).json({ message: 'Error getting ride stats', error: error.message });
  }
}; 