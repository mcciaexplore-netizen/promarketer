import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    // Ensure session is fresh
    const {
        data: { session },
    } = await supabase.auth.getSession()

    // Avoid redirect loops on auth routes
    if (req.nextUrl.pathname.startsWith('/auth')) {
        return res
    }

    // If not logged in and not heading to login -> redirect logic
    if (!session && req.nextUrl.pathname !== '/login') {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/login'
        redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
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
