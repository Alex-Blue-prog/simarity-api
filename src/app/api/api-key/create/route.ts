import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { nanoid } from "nanoid";
import { z } from "zod";

export async function POST(req: Request) {
    try {

        const session = await getServerSession(authOptions);
        const user = session?.user;

        if(!user) {
            return new NextResponse(JSON.stringify({error: "Unaunthorized to perform this action.", createdApiKey: null}), {
                status: 401
            });
        }

        const existingApiKey = await prisma.apiKey.findFirst({
            where: {UserId: user.id, enabled: true}
        })

        if(existingApiKey) {
            return new NextResponse(JSON.stringify({error: "You already have a valid API Key", createdApiKey: null}), {
                status: 400
            })
        }

        // create a new  apiKey for a user at the database
        const createdApiKey = await prisma.apiKey.create({
            data: {
                UserId: user.id,
                key: nanoid(),
            }
        })
        
        return NextResponse.json({error: null, createdApiKey});

    } catch(error) {

        if(error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify({error: error.issues, createdApiKey: null}), {
                status: 400
            })
        }

        return new NextResponse(JSON.stringify({error: "Internal Server Error", createdApiKey: null}), {
            status: 500
        })
    }
}