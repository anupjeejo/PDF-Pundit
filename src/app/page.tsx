import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { UserButton, auth } from '@clerk/nextjs'
import { eq } from 'drizzle-orm';
import { ArrowRight, LogIn } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  let firstChat;
  
  if (userId) {
    firstChat = await db.select().from(chats).where(eq(chats.userId, userId));
    if (firstChat) {
      firstChat = firstChat[0];
    }
  }

  return (
      <div className="flex min-h-screen w-screen bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center text-center">
            
            <div className="flex items-center">
              <h1 className="mr-3 text-5xl font-semibold">Understand any PDF with <br/>PDF-Pundit</h1>
              <UserButton afterSignOutUrl="/" />
            </div>

            <div className='flex mt-2'>
              { 
                isAuth && firstChat && (
                  <Link href={`/chat/${firstChat.id}`}>
                    <Button>
                      Go to chats <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                )
              }
            </div>

            <p className="max-w-xl mt-1 text-lg text-slate-600">
              Join students, researchers and professionals to instantly
              answer questions and understand research with AI.
            </p>

            <div className='w-full mt-4'>
              {
                isAuth ? (
                  <FileUpload/>
                ):
                (
                  <Link href="/sign-in">
                    <Button>
                      Login to get started
                      <LogIn className='w-4 h-4 ml-2'></LogIn>
                    </Button>
                  </Link>
                )
              }
            </div>

          </div>
        </div>
      </div>
  )
}
