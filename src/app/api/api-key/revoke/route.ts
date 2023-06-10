import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user;

        if(!user) {
            return new NextResponse(JSON.stringify({error: "Unauthorized", success: false}), {
                status: 401
            })
        }

        const validApiKey = await prisma.apiKey.findFirst({
            where: {UserId: user.id, enabled: true}
        })

        if(!validApiKey) {
            return new NextResponse(JSON.stringify({error: "This API Key can not be revoked"}), {
                status: 500
            })
        }

        // invalidate API Key
        await prisma.apiKey.update({
            where: {id: validApiKey.id},
            data: {enabled: false}
        })

        return NextResponse.json({error: null, success: true})

    } catch (error) {

        if(error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify({error: error.issues, success: false}), {
                status: 400
            })
        }

        return new NextResponse(JSON.stringify({error: "Internal Server Error", success: false}), {
            status: 500
        })
    }
    
}