// Mock implementation of ProductRepository for development
// This will be replaced with Prisma implementation once database is set up

import { ProductRepository } from './product.repository';
import { ProductFilters, ProductWithDetails, CreateProductDto, UpdateProductDto } from '../types/product';

export class MockProductRepository implements ProductRepository {
  private products: ProductWithDetails[] = [
    {
      id: '1',
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 199.99,
      sku: 'WH-001',
      stockQuantity: 50,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
      },
      images: [
        {
          id: 'img-1',
          url: 'https://example.com/images/headphones-1.jpg',
          altText: 'Wireless Headphones - Main Image',
          sortOrder: 0,
        },
        {
          id: 'img-2',
          url: 'https://example.com/images/headphones-2.jpg',
          altText: 'Wireless Headphones - Side View',
          sortOrder: 1,
        },
      ],
      reviews: [
        {
          id: 'rev-1',
          rating: 5,
          comment: 'Excellent sound quality!',
          createdAt: new Date().toISOString(),
          user: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      ],
      averageRating: 4.5,
      reviewCount: 128,
    },
    {
      id: '2',
      name: 'Smartphone',
      description: 'Latest model smartphone with advanced features',
      price: 699.99,
      sku: 'SP-001',
      stockQuantity: 25,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
      },
      images: [
        {
          id: 'img-3',
          url: 'https://example.com/images/smartphone-1.jpg',
          altText: 'Smartphone - Front View',
          sortOrder: 0,
        },
      ],
      reviews: [],
      averageRating: 4.2,
      reviewCount: 85,
    },
    {
      id: '3',
      name: 'Cotton T-Shirt',
      description: 'Comfortable cotton t-shirt in multiple colors',
      price: 29.99,
      sku: 'TS-001',
      stockQuantity: 100,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: {
        id: 'cat-2',
        name: 'Clothing',
        slug: 'clothing',
      },
      images: [
        {
          id: 'img-4',
          url: 'https://example.com/images/tshirt-1.jpg',
          altText: 'Cotton T-Shirt - Blue',
          sortOrder: 0,
        },
      ],
      reviews: [],
      averageRating: 4.0,
      reviewCount: 42,
    },
    {
      id: '4',
      name: 'Programming Book',
      description: 'Learn modern web development techniques',
      price: 49.99,
      sku: 'BK-001',
      stockQuantity: 30,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: {
        id: 'cat-3',
        name: 'Books',
        slug: 'books',
      },
      images: [
        {
          id: 'img-5',
          url: 'https://example.com/images/book-1.jpg',
          altText: 'Programming Book - Cover',
          sortOrder: 0,
        },
      ],
      reviews: [],
      averageRating: 4.8,
      reviewCount: 67,
    },
    {
      id: '5',
      name: 'Laptop',
      description: 'High-performance laptop for professionals',
      price: 1299.99,
      sku: 'LP-001',
      stockQuantity: 15,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
      },
      images: [
        {
          id: 'img-6',
          url: 'https://example.com/images/laptop-1.jpg',
          altText: 'Laptop - Closed',
          sortOrder: 0,
        },
        {
          id: 'img-7',
          url: 'https://example.com/images/laptop-2.jpg',
          altText: 'Laptop - Open',
          sortOrder: 1,
        },
      ],
      reviews: [],
      averageRating: 4.7,
      reviewCount: 156,
    },
  ];

  async findMany(filters: ProductFilters): Promise<ProductWithDetails[]> {
    let filtered = [...this.products];

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.category.slug === filters.category || product.category.id === filters.category
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply price filters
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(product => product.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(product => product.price <= filters.maxPrice!);
    }

    // Apply sorting
    const sort = filters.sort || 'createdAt';
    const order = filters.order || 'desc';
    
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sort) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'createdAt':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return order === 'asc' ? comparison : -comparison;
    });

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return filtered.slice(startIndex, endIndex);
  }

  async findById(id: string): Promise<ProductWithDetails | null> {
    return this.products.find(product => product.id === id) || null;
  }

  async count(filters: ProductFilters): Promise<number> {
    const filtered = await this.findMany({ ...filters, page: 1, limit: 1000 });
    return filtered.length;
  }

  async create(data: CreateProductDto): Promise<ProductWithDetails> {
    const newProduct: ProductWithDetails = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: {
        id: data.categoryId,
        name: 'Unknown Category',
        slug: 'unknown',
      },
      images: data.images?.map((img, index) => ({
        id: Math.random().toString(36).substr(2, 9),
        url: img.url,
        altText: img.altText || `${data.name} - Image ${index + 1}`,
        sortOrder: img.sortOrder || index,
      })) || [],
      reviews: [],
      averageRating: 0,
      reviewCount: 0,
    };

    this.products.push(newProduct);
    return newProduct;
  }

  async update(id: string, data: UpdateProductDto): Promise<ProductWithDetails> {
    const productIndex = this.products.findIndex(product => product.id === id);
    if (productIndex === -1) {
      throw new Error('Product not found');
    }

    this.products[productIndex] = {
      ...this.products[productIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return this.products[productIndex];
  }

  async delete(id: string): Promise<void> {
    const productIndex = this.products.findIndex(product => product.id === id);
    if (productIndex === -1) {
      throw new Error('Product not found');
    }

    this.products.splice(productIndex, 1);
  }
}