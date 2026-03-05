import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
    // Skip auth logic if Supabase env vars are not configured (e.g. during build)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return NextResponse.next()
    }

    const res = NextResponse.next()

    let session = null
    try {
        const supabase = createMiddlewareClient({ req, res })
        const { data } = await supabase.auth.getSession()
        session = data.session
    } catch {
        // If Supabase fails, allow the request through to avoid a 500
        return NextResponse.next()
    }

    // Avoid redirect loops on auth routes
    if (req.nextUrl.pathname.startsWith('/auth')) {
        return res
    }

    // If not logged in and not heading to login -> redirect
    if (!session && req.nextUrl.pathname !== '/login') {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/login'
        redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // If already logged in and going to login -> redirect to root
    if (session && req.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/', req.url))
    }

    return res
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
