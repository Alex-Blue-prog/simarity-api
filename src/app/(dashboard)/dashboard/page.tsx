import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from "next/navigation";
import prisma from '@/lib/db';

// components
import RequestApiKey from '@/components/RequestApiKey';
import ApiDashboard from '@/components/ApiDashboard';

export const metadata: Metadata = {
  title: "Similarity API |  Dashboard",
  description: "Free & open-source text similarity API"
}

const Dashboard = async () => {
    const user = await getServerSession(authOptions);

    if(!user) { 
      // notFound();
      redirect("/?callbackUrl=/protected/server")
    }

    const apiKey = await prisma.apiKey.findFirst({
      where: {UserId: user.user.id, enabled: true}
    })

  return (
    <div className='max-w-7xl mx-auto mt-16'>
      {apiKey ? ( <ApiDashboard /> ) : ( <RequestApiKey /> )}
    </div>
  )
}

export default Dashboard