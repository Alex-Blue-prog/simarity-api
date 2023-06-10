"use client"

import React, { FC, useState } from 'react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/DropdownMenu'
import { Button } from '@/ui/Button'
import { Loader2 } from 'lucide-react'
import { toast } from './ui/Toast'
import { useRouter } from 'next/navigation'
import { createApiKey } from '@/helpers/create-api-key'
import { revokeApiKey } from '@/helpers/rovoke-api-key'

interface ApiKeyOptionsProps {
    apiKeyId: string | undefined,
    apiKeyKey: string | undefined
}

const ApiKeyOptions:FC<ApiKeyOptionsProps> = ({apiKeyId, apiKeyKey}) => {
    const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
    const [isRevoking, setIsRevoking] = useState<boolean>(false);
    const router = useRouter();

    const createNewApiKey = async () => {
        setIsCreatingNew(true);

        try {
            if(!apiKeyId) return ;

            await revokeApiKey({keyId: apiKeyId})
            await createApiKey();
            router.refresh();

        } catch (error) {
            toast({
                title: "Error creating API Key",
                message: "Please try again later.",
                type: "error"
            })

        } finally {
            setIsCreatingNew(false);
        }

    }


    const revokeCurrentApiKey = async () => {
        setIsRevoking(true);

        try {
            if(!apiKeyId) return ;

            await revokeApiKey({keyId: apiKeyId})
            router.refresh();

        } catch (error) {
            toast({
                title: "Error revoking API Key",
                message: "Please try again later.",
                type: "error"
            })

        } finally {
            setIsRevoking(false);
        }
    }


    const copyKey = () => {
        window.navigator.clipboard.writeText(apiKeyKey ?? "")

        toast({
            title: "Copied",
            message: "API Key copied to clipboard",
            type: "success"
        })
    }

  return (
    <DropdownMenu>
        <DropdownMenuTrigger
            className='md:ml-auto'
            disabled={isCreatingNew || isRevoking} asChild
        >
            <Button variant={"subtle"} className='flex gap-2 items-center'>
                <p>
                    {isCreatingNew ? "Creating new key" : isRevoking ? "Revoking key" : "Options"}
                </p>
                { isCreatingNew || isRevoking ? (
                    <Loader2 className='animate-spin h-4 w-4' />
                ): null}
            </Button>
        </DropdownMenuTrigger>
        

        <DropdownMenuContent>
            <DropdownMenuItem onClick={copyKey}>Copy key</DropdownMenuItem>

            <DropdownMenuItem onClick={createNewApiKey}>Create new key</DropdownMenuItem>

            <DropdownMenuItem onClick={revokeCurrentApiKey}>Revoke key</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ApiKeyOptions