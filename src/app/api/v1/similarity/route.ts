import { cosineSimilarity } from "@/helpers/cosine-similarity";
import prisma from "@/lib/db";
import { openai } from "@/lib/openai";
import { NextResponse } from "next/server";
import { z } from "zod";

const reqSchema = z.object({
    text1: z.string().max(1000),
    text2: z.string().max(1000),

})

export async function POST(req: Request) {
    const body = await req.json() as unknown;

    const apiKey = req.headers.get("Authorization");
    if(!apiKey) {
        return new NextResponse(JSON.stringify({error: "Unauthorized"}), {
            status: 401
        })
    }

    try {
        const { text1, text2 } = reqSchema.parse(body);

        const validApiKey = await prisma.apiKey.findFirst({
            where: {
                key: apiKey,
                enabled: true
            }
        })

        if(!validApiKey) { 
            return new NextResponse(JSON.stringify({error: "Unauthorized"}), {
                status: 401
            })
        }

        const start = new Date();

        const embeddings = await Promise.all(
            [text1, text2].map(async (text) => {
                const res = await openai.createEmbedding({
                    model: "text-embedding-ada-002",
                    input: text
                })

                return res.data.data[0].embedding
            })
        )

        const similarity = cosineSimilarity(embeddings[0], embeddings[1]);

        const duration = new Date().getTime() - start.getTime();

        // persist request
        await prisma.apiRequest.create({
            data: {
                duration: duration,
                method: req.method,
                path: req.url,
                status: 200,
                ApiKeyId: validApiKey.id,
                usedApiKey: apiKey
            }
        })

        return NextResponse.json({ success: true, text1, text2, similarity });

    } catch (error) {

        if(error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify({error: error.issues}), {
                status: 400
            })
        }

        return  new NextResponse(JSON.stringify({error: "Internal Server Error"}), {
            status: 500
        })
    }

}