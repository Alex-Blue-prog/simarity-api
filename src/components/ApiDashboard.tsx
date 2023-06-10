import React from 'react'

import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/db';
import { formatDistance } from "date-fns";

// components
import LargeHeading from './ui/LargeHeading';
import Paragraph from './ui/Paragraph';
import { Input } from './ui/Input';
import Table from './Table';
import ApiKeyOptions from './ApiKeyOptions';

const ApiDashboard = async () => {
  const user = await getServerSession(authOptions);

  // get all apiKeys from this user
  const apiKeys = await prisma.apiKey.findMany({
    where: { UserId: user?.user.id}
  })

  // get the only the enabled apiKey
  const activeApiKey = apiKeys.find(apiKey => apiKey.enabled === true);

  // get all requests from this user done with all apiKeys
  const userRequests = await prisma.apiRequest.findMany({
    where: {
      ApiKeyId:{ in: apiKeys.map(value => value.id) }
    }
  })

  // turn all the requests with a readable timestamp
  const serializableRequests = userRequests.map((req) => ({
    ...req,
    timestamp: formatDistance(new Date(req.timestamp), new Date())
  }))

  return (
    <div className='container flex flex-col gap-6'>
      <LargeHeading>Welcome back, {user?.user.name}</LargeHeading>
      <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start items-center">
        <Paragraph className='mt-2'>Your API key:</Paragraph>
        <Input className='w-fit truncate' readOnly value={activeApiKey?.key} />
        {/* add options to create new & revoke */}
        <ApiKeyOptions apiKeyId={activeApiKey?.id} apiKeyKey={activeApiKey?.key} />
      </div>

      <Paragraph className='text-center md:text-left mt-4 -mb-4'>Your API history:</Paragraph>
      <Table userRequests={serializableRequests} />
    </div>
  )
}

export default ApiDashboard