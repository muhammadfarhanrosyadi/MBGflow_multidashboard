const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface LoginResponse {
  success: boolean;
  user?: {
    username: string;
    role: string;
  };
  message?: string;
}

export interface User {
  username: string;
  role: string;
}

// TASK 1: Login service
export const loginUser = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Gagal terhubung ke server',
    };
  }
};

// TASK 2: Check user access
export const checkUserAccess = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
};
