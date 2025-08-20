import { ProductRepository } from '../repositories/product.repository';
import { ProductFilters, ProductWithDetails, CreateProductDto, UpdateProductDto, PaginatedResponse } from '../types/product';

// Define pagination constants locally for now
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  async getProducts(filters: ProductFilters): Promise<PaginatedResponse<ProductWithDetails>> {
    // Validate and set defaults
    const page = Math.max(1, filters.page || PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, filters.limit || PAGINATION.DEFAULT_LIMIT));
    
    const validatedFilters = {
      ...filters,
      page,
      limit,
    };

    const [products, total] = await Promise.all([
      this.productRepository.findMany(validatedFilters),
      this.productRepository.count(validatedFilters),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getProductById(id: string): Promise<ProductWithDetails | null> {
    if (!id) {
      throw new Error('Product ID is required');
    }

    return this.productRepository.findById(id);
  }

  async searchProducts(query: string, filters: Omit<ProductFilters, 'search'>): Promise<PaginatedResponse<ProductWithDetails>> {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query is required');
    }

    return this.getProducts({
      ...filters,
      search: query.trim(),
    });
  }

  async createProduct(data: CreateProductDto): Promise<ProductWithDetails> {
    // Basic validation
    if (!data.name || !data.description || !data.sku || !data.categoryId) {
      throw new Error('Missing required fields: name, description, sku, categoryId');
    }

    if (data.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    if (data.stockQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    return this.productRepository.create(data);
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<ProductWithDetails> {
    if (!id) {
      throw new Error('Product ID is required');
    }

    // Validate price if provided
    if (data.price !== undefined && data.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    // Validate stock quantity if provided
    if (data.stockQuantity !== undefined && data.stockQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    return this.productRepository.update(id, data);
  }

  async deleteProduct(id: string): Promise<void> {
    if (!id) {
      throw new Error('Product ID is required');
    }

    await this.productRepository.delete(id);
  }

  // Additional utility methods
  async getProductsByCategory(categoryId: string, filters: Omit<ProductFilters, 'category'>): Promise<PaginatedResponse<ProductWithDetails>> {
    return this.getProducts({
      ...filters,
      category: categoryId,
    });
  }

  async getFeaturedProducts(limit: number = 8): Promise<ProductWithDetails[]> {
    const response = await this.getProducts({
      limit,
      sort: 'createdAt',
      order: 'desc',
    });

    return response.data;
  }
}