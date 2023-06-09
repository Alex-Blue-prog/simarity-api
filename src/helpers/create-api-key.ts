import { createApiData } from "@/types/api";

export async function createApiKey() {
    const res = await fetch("/api/api-key/create");
    const data = await res.json() as createApiData;

    if(data.error || !data.createdApiKey) {
        if(data.error instanceof Array) {
            throw new Error(data.error.join(" "));
        }

        throw new Error(data.error ?? "Somenthing went wrong.");
    }

    return data.createdApiKey.key;
}