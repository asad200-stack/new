'use client'

import { useEffect, useState } from 'react'

interface Inquiry {
  id: string
  name: string
  email: string
  phone?: string | null
  message: string
  status: string
  createdAt: string
  product?: {
    id: string
    name: string
    slug: string
  } | null
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/store/inquiries')
      const data = await response.json()
      setInquiries(data.inquiries || [])
    } catch (error) {
      console.error('Error fetching inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
        <p className="mt-2 text-gray-600">Customer messages and inquiries</p>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No inquiries yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {inquiry.name}
                  </h3>
                  <p className="text-sm text-gray-500">{inquiry.email}</p>
                  {inquiry.phone && (
                    <p className="text-sm text-gray-500">{inquiry.phone}</p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    inquiry.status === 'NEW'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {inquiry.status}
                </span>
              </div>
              {inquiry.product && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Product: <span className="font-medium">{inquiry.product.name}</span>
                  </p>
                </div>
              )}
              <p className="text-gray-700 mb-4">{inquiry.message}</p>
              <p className="text-xs text-gray-400">
                {new Date(inquiry.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
