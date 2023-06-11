import NextAuth from "next-auth/next";
import prisma from '@/lib/db'
import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    callbacks: {
        async session({session, token}) {
            
            if(token) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture;   
            }

            return session;
        },
        async jwt({token, user}) {

            const dbUser = await prisma.user.findFirst({
                where: {
                    email: token.email
                }
            })

            // console.log("user: ", user);
            // console.log("token: ", token);

            if(!dbUser) {
                token.id = user.id;
                return token;
            }
       
            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
            };
            
            // return {...token, ...user};
        },
        // redirect() {
        //     return "/dashboard"
        // },
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    // debug: process.env.NODE_ENV !== "production",
    pages: {
        error:  "/",
    }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST}
