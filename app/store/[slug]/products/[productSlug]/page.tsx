'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import LanguageToggle from '@/components/LanguageToggle'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description?: string | null
  price: number
  salePrice?: number | null
  currency: string
  images: Array<{ url: string; isPrimary: boolean }>
  category?: {
    name: string
    slug: string
  } | null
}

export default function ProductPage() {
  const params = useParams()
  const storeSlug = params.slug as string
  const productSlug = params.productSlug as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [storeSlug, productSlug])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/stores/${storeSlug}/products/${productSlug}`)
      const data = await response.json()
      setProduct(data.product)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`/api/stores/${storeSlug}/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...inquiryForm,
          productId: product?.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to send inquiry')
        return
      }

      alert('Inquiry sent successfully!')
      setInquiryForm({ name: '', email: '', phone: '', message: '' })
    } catch (error) {
      console.error('Error sending inquiry:', error)
      alert('An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
          <Link href={`/store/${storeSlug}`} className="text-blue-600 hover:text-blue-700">
            ← Back to store
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href={`/store/${storeSlug}`} className="text-blue-600 hover:text-blue-700">
              ← Back to store
            </Link>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {product.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            {product.category && (
              <p className="text-sm text-gray-500 mb-4">{product.category.name}</p>
            )}
            <div className="mb-6">
              {product.salePrice ? (
                <div>
                  <span className="text-3xl font-bold text-red-600">
                    ${product.salePrice}
                  </span>
                  <span className="ml-3 text-xl text-gray-500 line-through">
                    ${product.price}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              )}
            </div>

            {product.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Inquiry</h2>
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={inquiryForm.name}
                    onChange={(e) =>
                      setInquiryForm({ ...inquiryForm, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={inquiryForm.email}
                    onChange={(e) =>
                      setInquiryForm({ ...inquiryForm, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={inquiryForm.phone}
                    onChange={(e) =>
                      setInquiryForm({ ...inquiryForm, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={inquiryForm.message}
                    onChange={(e) =>
                      setInquiryForm({ ...inquiryForm, message: e.target.value })
                    }
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
