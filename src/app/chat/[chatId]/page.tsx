import React from 'react'
import { redirect } from "next/navigation"
import { auth } from '@clerk/nextjs'
import { chats } from '@/lib/db/schema'
import ChatSideBar from '@/components/ChatSideBar'
import PDFViewer from '@/components/PDFViewer'
import ChatComponent from '@/components/ChatComponent'
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

type Props = {
    params: {
        chatId: string,
    }
}

const ChatPage = async ({ params: { chatId }}: Props) => {
  const { userId } = await auth();
    
    if(!userId) {
        return redirect('/sign-in')
    }

    const _chats = await db.select().from(chats).where(eq(chats.userId, userId))
    console.log("chats: ", _chats)
    if(!_chats)
    {
        console.log("inside the 1 if condition")
        return redirect('/')
    }

    if(!_chats.find((chat) => chat.id === parseInt(chatId)))
    {
        console.log("chatId:", chatId)
        console.log("inside the 2 if condition")
        return redirect('/')
    }

    const currentChat = _chats.find(chat => chat.id === parseInt(chatId))

  return (
    <div className='flex max-h-screen overflow-scroll'>
        <div className='flex w-full max-h-screen overflow-scroll'>
            {/* Chat Sidebar */}
            <div className='flex-[1] max-w-xs'>
                <ChatSideBar chats={_chats} chatId={parseInt(chatId)}/>
            </div>

            {/* PDF Viewer */}
            <div className='max-h-screen p-4 overflow-scroll flex-[5]'>
                {currentChat?.pdfUrl}
                <PDFViewer pdf_url={currentChat?.pdfUrl || ''}/>
            </div>

            {/* Chat Component */}
            <div className='flex-[3] border-l-4 border-l-slate-200'>
                <ChatComponent chatId={parseInt(chatId)}/>
            </div>
        </div>
    </div>
  )
}

export default ChatPage