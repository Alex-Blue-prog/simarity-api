import { withAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server'

import { Redis } from "@upstash/redis/nodejs";
import { Ratelimit } from "@upstash/ratelimit";

const redis = new Redis({
    url: process.env.REDIS_URL as string,
    token: process.env.REDIS_SECRET as string
})

const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h")
})

export default withAuth(
    async function middleware(req) {
        const pathname = req.nextUrl.pathname;

        //Manage rate limiting
        if(pathname.startsWith("/api")) {

            const ip = req.ip ?? "127.0.0.1";

            try {
                const {success} = await ratelimit.limit(ip);

                if(!success) {
                    return new NextResponse(JSON.stringify({error: "Too many requests"}), {
                        status: 200,
                    });
                }

                return NextResponse.next();

            } catch (error) {
                return NextResponse.json({error: "Internal Server Error"});
            }
        }

        //Manage route protection
        const token = req.nextauth.token;
        const isAuth = token ? true : false;

        const isAuthPage = pathname.startsWith("/login");


        // if user is in the login page and is already logged redirect the page to the dashboard page
        if(isAuthPage) {
            if(isAuth) {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }

            return null;
        }

        // if user is not logged in and tried to access any of the sensitive routes, redirect the user to the login page
        const sensitiveRoutes = ["/dashboard"];

        if(!isAuth && sensitiveRoutes.some((route) => pathname.startsWith(route))) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

    }, 
    {
        callbacks: {
            authorized: ({ token }) => true
        },

    }
)

// run the middleware only at this endpoints
export const config = { matcher: ["/", "/login", "/dashboard/:path*", "/api/:path*"] }