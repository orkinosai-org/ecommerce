'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product, apiClient } from '../lib/api';
import ProductCard from '../components/products/ProductCard';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await apiClient.getFeaturedProducts(4);
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
              E-Commerce Platform
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Welcome to our modern e-commerce platform. Discover amazing products, 
              enjoy seamless shopping, and experience excellent customer service.
            </p>
            <div className="mt-10">
              <Link
                href="/products"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          <p className="mt-4 text-lg text-gray-600">
            Check out our most popular items
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg animate-pulse">
                <div className="aspect-square bg-gray-300 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/products"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            View All Products →
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link
              href="/products"
              className="group rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="mb-3 text-2xl font-semibold group-hover:text-blue-600 transition-colors">
                Products
              </h3>
              <p className="text-gray-600">
                Browse our wide selection of high-quality products
              </p>
            </Link>

            <div className="group rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
              <h3 className="mb-3 text-2xl font-semibold group-hover:text-blue-600 transition-colors">
                Cart
              </h3>
              <p className="text-gray-600">
                Manage your shopping cart and checkout securely
              </p>
            </div>

            <div className="group rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
              <h3 className="mb-3 text-2xl font-semibold group-hover:text-blue-600 transition-colors">
                Orders
              </h3>
              <p className="text-gray-600">
                Track your order history and delivery status
              </p>
            </div>

            <div className="group rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
              <h3 className="mb-3 text-2xl font-semibold group-hover:text-blue-600 transition-colors">
                Account
              </h3>
              <p className="text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
