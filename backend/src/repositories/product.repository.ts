import { ProductFilters, ProductWithDetails, CreateProductDto, UpdateProductDto } from '../types/product';

export interface ProductRepository {
  findMany(filters: ProductFilters): Promise<ProductWithDetails[]>;
  findById(id: string): Promise<ProductWithDetails | null>;
  count(filters: ProductFilters): Promise<number>;
  create(data: CreateProductDto): Promise<ProductWithDetails>;
  update(id: string, data: UpdateProductDto): Promise<ProductWithDetails>;
  delete(id: string): Promise<void>;
}