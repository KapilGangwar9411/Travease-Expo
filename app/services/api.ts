import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get the API URL based on the environment
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

/**
 * Base API service for handling HTTP requests
 */
class ApiService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  /**
   * Load authentication token from storage
   */
  private async loadToken() {
    try {
      const authData = await AsyncStorage.getItem('auth-storage');
      if (authData) {
        const parsedData = JSON.parse(authData);
        if (parsedData.state && parsedData.state.token) {
          this.token = parsedData.state.token;
        }
      }
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  /**
   * Set authentication token
   */
  public setToken(token: string) {
    this.token = token;
  }

  /**
   * Get headers for requests
   */
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'An error occurred');
    }
    return response.json() as Promise<T>;
  }

  /**
   * Make a GET request
   */
  public async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(includeAuth),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Make a POST request
   */
  public async post<T>(endpoint: string, data: any, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Make a PUT request
   */
  public async put<T>(endpoint: string, data: any, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Make a DELETE request
   */
  public async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(includeAuth),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Upload a file
   * @param endpoint API endpoint
   * @param uri Local URI of the file
   * @param name Name of the file parameter
   * @param type MIME type of the file
   * @param additionalFields Additional form fields to include
   */
  public async uploadFile<T>(
    endpoint: string,
    uri: string,
    name: string = 'file',
    type: string = 'image/jpeg',
    additionalFields: Record<string, string> = {}
  ): Promise<T> {
    // Make sure we have a token
    if (!this.token) {
      await this.loadToken();
    }

    // Create form data
    const formData = new FormData();
    
    // Append file
    formData.append(name, {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: uri.split('/').pop() || 'image.jpg',
      type,
    } as any);

    // Append additional fields
    Object.entries(additionalFields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Make request
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': this.token ? `Bearer ${this.token}` : '',
        // Note: Don't set Content-Type for multipart/form-data
      },
      body: formData,
    });

    return this.handleResponse<T>(response);
  }
}

export const apiService = new ApiService(); 