'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Product, apiClient } from '../../../lib/api';

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      setLoading(true);
      setError(null);

      try {
        const productData = await apiClient.getProduct(productId);
        if (productData) {
          setProduct(productData);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-300 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="aspect-square bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                <div className="h-12 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">
              {error || 'Product not found'}
            </div>
            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  const selectedImage = product.images[selectedImageIndex] || product.images[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/products" className="text-gray-500 hover:text-gray-700">
            Products
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href={`/products?category=${product.category.slug}`} className="text-gray-500 hover:text-gray-700">
            {product.category.name}
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
              {selectedImage ? (
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.altText || product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}
            </div>

            {/* Thumbnail images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-white rounded-lg shadow-sm overflow-hidden border-2 transition-colors ${
                      index === selectedImageIndex
                        ? 'border-blue-500'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || `${product.name} - Image ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formattedPrice}
                </span>
                
                {product.averageRating && (
                  <div className="flex items-center space-x-2">
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.averageRating!)
                              ? 'fill-current'
                              : 'fill-gray-300'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>SKU: {product.sku}</span>
                <span>Category: {product.category.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  product.stockQuantity > 10 
                    ? 'bg-green-100 text-green-800' 
                    : product.stockQuantity > 0 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stockQuantity > 10 
                    ? 'In Stock' 
                    : product.stockQuantity > 0 
                    ? `Only ${product.stockQuantity} left` 
                    : 'Out of Stock'
                  }
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Add to cart button (placeholder) */}
            <div className="space-y-4">
              <button
                disabled={product.stockQuantity === 0}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              
              <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Add to Wishlist
              </button>
            </div>

            {/* Reviews section */}
            {product.reviews && product.reviews.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h2>
                <div className="space-y-4">
                  {product.reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex text-yellow-400">
                          {Array.from({ length: 5 }, (_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'fill-current' : 'fill-gray-300'
                              }`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="font-medium text-gray-900">
                          {review.user.firstName} {review.user.lastName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}