'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import LanguageToggle from '@/components/LanguageToggle'
import Link from 'next/link'

interface Store {
  id: string
  name: string
  description?: string | null
  logo?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  contactAddress?: string | null
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number | null
  currency: string
  images: Array<{ url: string }>
  category?: {
    name: string
  } | null
}

export default function StorePage() {
  const params = useParams()
  const slug = params.slug as string
  const [store, setStore] = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStore()
    fetchProducts()
  }, [slug])

  const fetchStore = async () => {
    try {
      const response = await fetch(`/api/stores/${slug}`)
      const data = await response.json()
      setStore(data.store)
    } catch (error) {
      console.error('Error fetching store:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/stores/${slug}/products`)
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store not found</h1>
          <p className="text-gray-600">The store you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {store.logo && (
                <img src={store.logo} alt={store.name} className="h-12 w-12 object-contain" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
                {store.description && (
                  <p className="text-sm text-gray-600">{store.description}</p>
                )}
              </div>
            </div>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/store/${slug}/products/${product.slug}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {product.images.length > 0 && (
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  {product.category && (
                    <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
                  )}
                  <div className="flex items-center justify-between">
                    {product.salePrice ? (
                      <div>
                        <span className="text-xl font-bold text-red-600">
                          ${product.salePrice}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          ${product.price}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-gray-900">
                        ${product.price}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {(store.contactEmail || store.contactPhone || store.contactAddress) && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <div className="space-y-2">
              {store.contactEmail && (
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {store.contactEmail}
                </p>
              )}
              {store.contactPhone && (
                <p className="text-gray-600">
                  <span className="font-medium">Phone:</span> {store.contactPhone}
                </p>
              )}
              {store.contactAddress && (
                <p className="text-gray-600">
                  <span className="font-medium">Address:</span> {store.contactAddress}
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
