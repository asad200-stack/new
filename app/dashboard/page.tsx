'use client'

import { useAuth } from '@/lib/useAuth'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const { store } = useAuth()
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    inquiries: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [productsRes, categoriesRes, inquiriesRes] = await Promise.all([
        fetch('/api/store/products'),
        fetch('/api/store/categories'),
        fetch('/api/store/inquiries'),
      ])

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      const inquiriesData = await inquiriesRes.json()

      setStats({
        products: productsData.products?.length || 0,
        categories: categoriesData.categories?.length || 0,
        inquiries: inquiriesData.inquiries?.length || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's your store overview.</p>
      </div>

      {store && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            {store.status === 'PENDING' && 'Your store is pending approval.'}
            {store.status === 'SUSPENDED' && 'Your store has been suspended. Please contact support.'}
            {store.status === 'ACTIVE' && 'Your store is active and visible to customers.'}
          </p>
          {store.status === 'ACTIVE' && (
            <Link
              href={`/store/${store.slug}`}
              target="_blank"
              className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View your public store →
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📦</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Products
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.products}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard/products"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Manage products →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📁</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Categories
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.categories}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard/categories"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Manage categories →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">✉️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Inquiries
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.inquiries}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard/inquiries"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View inquiries →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/products/new"
            className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition"
          >
            <h3 className="font-medium text-gray-900">Add New Product</h3>
            <p className="mt-1 text-sm text-gray-500">Create a new product listing</p>
          </Link>
          <Link
            href="/dashboard/categories/new"
            className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition"
          >
            <h3 className="font-medium text-gray-900">Add Category</h3>
            <p className="mt-1 text-sm text-gray-500">Organize your products</p>
          </Link>
          <Link
            href="/dashboard/settings"
            className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition"
          >
            <h3 className="font-medium text-gray-900">Store Settings</h3>
            <p className="mt-1 text-sm text-gray-500">Customize your store</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
