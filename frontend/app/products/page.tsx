'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product, ProductFilters, apiClient } from '../../lib/api';
import ProductGrid from '../../components/products/ProductGrid';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  // Get filters from URL
  const getFiltersFromUrl = (): ProductFilters => {
    return {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      minPrice: Number(searchParams.get('minPrice')) || undefined,
      maxPrice: Number(searchParams.get('maxPrice')) || undefined,
      sort: (searchParams.get('sort') as 'name' | 'price' | 'createdAt') || 'createdAt',
      order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
    };
  };

  // Update URL with filters
  const updateUrl = (filters: ProductFilters) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });

    router.push(`/products?${params.toString()}`);
  };

  // Fetch products
  const fetchProducts = async (filters: ProductFilters) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (filters.search) {
        const { search, ...otherFilters } = filters;
        response = await apiClient.searchProducts(search, otherFilters);
      } else {
        response = await apiClient.getProducts(filters);
      }

      setProducts(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    const filters = getFiltersFromUrl();
    const newFilters = { ...filters, search: query, page: 1 };
    updateUrl(newFilters);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const filters = getFiltersFromUrl();
    const newFilters = { ...filters, page };
    updateUrl(newFilters);
  };

  // Handle category filter
  const handleCategoryChange = (category: string) => {
    const filters = getFiltersFromUrl();
    const newFilters = { ...filters, category: category || undefined, page: 1 };
    updateUrl(newFilters);
  };

  // Handle sort change
  const handleSortChange = (sort: string, order: string) => {
    const filters = getFiltersFromUrl();
    const newFilters = { 
      ...filters, 
      sort: sort as 'name' | 'price' | 'createdAt',
      order: order as 'asc' | 'desc',
      page: 1 
    };
    updateUrl(newFilters);
  };

  // Effect to fetch products when URL changes
  useEffect(() => {
    const filters = getFiltersFromUrl();
    fetchProducts(filters);
  }, [searchParams]);

  const currentFilters = getFiltersFromUrl();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
          
          {/* Search and filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <SearchBar 
              onSearch={handleSearch}
              initialValue={currentFilters.search || ''}
            />
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Category filter */}
              <select
                value={currentFilters.category || ''}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
              </select>

              {/* Sort filter */}
              <select
                value={`${currentFilters.sort}-${currentFilters.order}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  handleSortChange(sort, order);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low to High</option>
                <option value="price-desc">Price High to Low</option>
              </select>
            </div>
          </div>

          {/* Results summary */}
          {!loading && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {products.length} of {meta.total} products
              {currentFilters.search && (
                <span> for "{currentFilters.search}"</span>
              )}
              {currentFilters.category && (
                <span> in {currentFilters.category}</span>
              )}
            </div>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-red-800">
              Error: {error}
            </div>
          </div>
        )}

        {/* Products grid */}
        <ProductGrid products={products} loading={loading} />

        {/* Pagination */}
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}