import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

let locales = ['en-US', 'zh-CN']
const getLocale = (request: NextRequest) => {
    let headers = { 'accept-language': request.headers.get('accept-language') || 'zh-CN,zh;q=0.9,en-US,en;q=0.8' };
    let languages = new Negotiator({ headers }).languages()
    let defaultLocale = 'zh-CN'
    return match(languages, locales, defaultLocale) // -> 'en-US'
}

export default NextAuth(authConfig).auth;

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};


export function middleware(request: NextRequest) {
    // Check if there is any supported locale in the pathname
    const { pathname } = request.nextUrl
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (pathnameHasLocale) return

    // Redirect if there is no locale
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`
    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(request.nextUrl)
}
