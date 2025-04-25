// User service implementation
import { apiService } from './api';

/**
 * User service for user-related API operations
 */
class UserService {
  /**
   * Get user profile
   */
  public async getProfile() {
    return apiService.get<any>('/users/profile');
  }

  /**
   * Update user profile
   * @param userData User data to update
   */
  public async updateProfile(userData: any) {
    return apiService.put<any>('/users/profile', userData);
  }

  /**
   * Update user profile picture with URL
   * @param imageUrl URL of the profile picture
   */
  public async updateProfilePictureUrl(imageUrl: string) {
    return apiService.put<any>('/users/profile-picture', { imageUrl });
  }

  /**
   * Upload and update user profile picture
   * @param uri Local URI of the image
   */
  public async uploadProfilePicture(uri: string) {
    return apiService.uploadFile<any>(
      '/users/profile-picture',
      uri,
      'profileImage',
      'image/jpeg'
    );
  }
}

export const userService = new UserService(); 