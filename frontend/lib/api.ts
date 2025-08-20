// API client for communicating with the backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'name' | 'price' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: Array<{
    id: string;
    url: string;
    altText?: string;
    sortOrder: number;
  }>;
  reviews?: Array<{
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
    };
  }>;
  averageRating?: number;
  reviewCount?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    const response = await this.request<ApiResponse<Product[]> & { meta: PaginatedResponse<Product>['meta'] }>(endpoint);
    
    return {
      data: response.data || [],
      meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
  }

  async searchProducts(query: string, filters: Omit<ProductFilters, 'search'> = {}): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({ q: query });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/products/search?${queryString}`;

    const response = await this.request<ApiResponse<Product[]> & { meta: PaginatedResponse<Product>['meta'] }>(endpoint);
    
    return {
      data: response.data || [],
      meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const response = await this.request<ApiResponse<Product>>(`/products/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return null;
    }
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      const response = await this.request<ApiResponse<Product[]>>(`/products/featured?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      return [];
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;