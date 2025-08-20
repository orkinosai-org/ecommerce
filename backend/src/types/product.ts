export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: 'name' | 'price' | 'createdAt';
  order?: 'asc' | 'desc';
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

export interface ProductWithDetails {
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

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  sku: string;
  stockQuantity: number;
  categoryId: string;
  images?: Array<{
    url: string;
    altText?: string;
    sortOrder?: number;
  }>;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  categoryId?: string;
  isActive?: boolean;
}