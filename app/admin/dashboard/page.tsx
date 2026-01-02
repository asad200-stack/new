'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'

interface Store {
  id: string
  name: string
  slug: string
  status: string
  createdAt: string
  owner: {
    name: string
    email: string
  }
  _count: {
    products: number
    orders: number
  }
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard')
      return
    }
    fetchStores()
  }, [user])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/admin/stores')
      if (!response.ok) {
        router.push('/admin/login')
        return
      }
      const data = await response.json()
      setStores(data.stores || [])
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStoreStatus = async (storeId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storeId, status }),
      })

      if (response.ok) {
        fetchStores()
      } else {
        alert('Failed to update store status')
      }
    } catch (error) {
      console.error('Error updating store:', error)
      alert('An error occurred')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Super Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">{user?.name}</span>
              <button
                onClick={logout}
                className="text-white hover:text-gray-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Stores</h2>
            <p className="mt-1 text-gray-600">Manage store accounts</p>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {stores.map((store) => (
                <li key={store.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {store.name}
                          </p>
                          <span
                            className={`ml-3 px-2 py-1 text-xs rounded-full ${
                              store.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : store.status === 'SUSPENDED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {store.status}
                          </span>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              Owner: {store.owner.name} ({store.owner.email})
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              {store._count.products} products • {store._count.orders} orders
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Slug: {store.slug} • Created: {new Date(store.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex space-x-2">
                        {store.status !== 'ACTIVE' && (
                          <button
                            onClick={() => updateStoreStatus(store.id, 'ACTIVE')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Activate
                          </button>
                        )}
                        {store.status !== 'SUSPENDED' && (
                          <button
                            onClick={() => updateStoreStatus(store.id, 'SUSPENDED')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Suspend
                          </button>
                        )}
                        {store.status !== 'PENDING' && (
                          <button
                            onClick={() => updateStoreStatus(store.id, 'PENDING')}
                            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                          >
                            Set Pending
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
