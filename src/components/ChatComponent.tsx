"use client"
import { Send } from 'lucide-react'
import { Input } from './ui/input'
import { useChat } from 'ai/react'
import { Button } from './ui/button'
import MessageList from './MessageList'
import React from 'react'

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
    const { input, handleInputChange, handleSubmit, messages } = useChat({
        api: '/api/chat',
        body: {
            chatId
        }
    });

    React.useEffect(() => {
        const messageContainer = document.getElementById("message-container")
        if(messageContainer) {
            messageContainer.scrollTo({
                top: messageContainer.scrollHeight,
                behavior: "smooth"
            })
        }
    })

  return (
    <div className='relative max-h-screen overflow-scroll'
         id='message-container'>
        {/* Header */}
        <div className='sticky top-0 inset-x-0 p-2 bg-white h-fit'>
            <h3 className='text-xl font-bold'>Chat</h3>
        </div>

        {/* Chat Space */}
        <MessageList messages={messages}/>

        {/* Query to AI */}
        <form onSubmit={handleSubmit}
              className='sticky bottom-0 inset-x-0 px-2 py-4 bg-white'>
            <div>
                <Input
                    className='w-full'
                    value={input} 
                    onChange={handleInputChange}
                    placeholder='Ask any questions here....'/>
                <Button className='bg-blue-600 ml-2'>
                    <Send className='h-4 w-4'/>
                </Button>
            </div>
        </form>
    </div>
  )
}

export default ChatComponent