'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/useAuth'

export default function SettingsPage() {
  const { store, refetch } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || '',
        description: (store as any).description || '',
        contactEmail: (store as any).contactEmail || '',
        contactPhone: (store as any).contactPhone || '',
        contactAddress: (store as any).contactAddress || '',
      })
    }
  }, [store])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('contactEmail', formData.contactEmail)
      formDataToSend.append('contactPhone', formData.contactPhone)
      formDataToSend.append('contactAddress', formData.contactAddress)

      if (logoFile) {
        formDataToSend.append('logo', logoFile)
      }

      const response = await fetch('/api/store/settings', {
        method: 'PUT',
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to update settings')
        return
      }

      alert('Settings updated successfully')
      refetch()
    } catch (error) {
      console.error('Error updating settings:', error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!store) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Store Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Store Name *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.contactEmail}
            onChange={(e) =>
              setFormData({ ...formData, contactEmail: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Phone
          </label>
          <input
            type="tel"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.contactPhone}
            onChange={(e) =>
              setFormData({ ...formData, contactPhone: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Address
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.contactAddress}
            onChange={(e) =>
              setFormData({ ...formData, contactAddress: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Store Logo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setLogoFile(e.target.files ? e.target.files[0] : null)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
