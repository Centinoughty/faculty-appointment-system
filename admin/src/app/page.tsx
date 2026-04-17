import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Home() {
    // Basic server-side check for admin cookies (simplified)
    const cookieStore = await cookies();
    const hasToken = cookieStore.has('access_token');
    
    if (hasToken) {
        redirect('/analytics');
    }
    
    redirect('/login');
}
