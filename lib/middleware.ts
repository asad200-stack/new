import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JWTPayload } from './auth'
import { UserRole } from '@prisma/client'
import { prisma } from './prisma'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

export async function authenticate(
  request: NextRequest
): Promise<{ user: JWTPayload } | { error: NextResponse }> {
  try {
    const authHeader = request.headers.get('authorization')
    let token: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      // Check cookies
      const cookieHeader = request.headers.get('cookie')
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {} as Record<string, string>)
        token = cookies['auth-token'] || null
      }
    }

    if (!token) {
      return {
        error: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        ),
      }
    }

    const payload = verifyToken(token)
    return { user: payload }
  } catch (error) {
    return {
      error: NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      ),
    }
  }
}

export async function requireAuth(
  request: NextRequest,
  allowedRoles?: UserRole[]
): Promise<{ user: JWTPayload } | { error: NextResponse }> {
  const authResult = await authenticate(request)
  if ('error' in authResult) {
    return authResult
  }

  const { user } = authResult

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      error: NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      ),
    }
  }

  return { user }
}

export async function requireStoreOwner(
  request: NextRequest,
  storeId?: string
): Promise<{ user: JWTPayload; storeId: string } | { error: NextResponse }> {
  const authResult = await requireAuth(request, [UserRole.STORE_OWNER, UserRole.SUPER_ADMIN])
  if ('error' in authResult) {
    return authResult
  }

  const { user } = authResult

  // Super admin can access any store
  if (user.role === UserRole.SUPER_ADMIN) {
    if (storeId) {
      return { user, storeId }
    }
    return {
      error: NextResponse.json(
        { error: 'Store ID required' },
        { status: 400 }
      ),
    }
  }

  // Store owner can only access their own store
  if (!user.storeId) {
    return {
      error: NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      ),
    }
  }

  const finalStoreId = storeId || user.storeId

  // Verify store ownership (unless super admin)
  if (finalStoreId !== user.storeId) {
    return {
      error: NextResponse.json(
        { error: 'Access denied to this store' },
        { status: 403 }
      ),
    }
  }

  return { user, storeId: finalStoreId }
}

export async function requireSuperAdmin(
  request: NextRequest
): Promise<{ user: JWTPayload } | { error: NextResponse }> {
  return requireAuth(request, [UserRole.SUPER_ADMIN])
}
