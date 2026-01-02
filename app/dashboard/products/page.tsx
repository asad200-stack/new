'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number | null
  currency: string
  stockQuantity: number
  status: string
  isVisible: boolean
  images: Array<{ url: string; isPrimary: boolean }>
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/store/products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/store/products/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchProducts()
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('An error occurred')
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-gray-600">Manage your product catalog</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">No products yet</p>
          <Link
            href="/dashboard/products/new"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first product →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {product.images.length > 0 && (
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    {product.salePrice ? (
                      <div>
                        <span className="text-lg font-bold text-red-600">
                          ${product.salePrice}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          ${product.price}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        ${product.price}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      product.isVisible && product.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {product.isVisible && product.status === 'ACTIVE'
                      ? 'Visible'
                      : 'Hidden'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Stock: {product.stockQuantity}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="flex-1 text-center px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
