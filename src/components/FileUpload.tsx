'use client'

import { uploadToS3 } from '@/lib/s3';
import axios from 'axios';
import { Inbox, Loader2 } from 'lucide-react';
import React, { useState} from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

function FileUpload() {
    const [uploading, setUploading] = useState(false)
    const router = useRouter()
    const { mutate, isLoading } = useMutation({
        mutationFn: async ({
            file_key,
            file_name,
        }: {
            file_key: string;
            file_name: string;
        }) => {
            const response = await axios.post("/api/create-chat", {file_key, file_name});
            return response.data;
        }
    })

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (uploadedFile) => {
        console.log(uploadedFile);
        const file = uploadedFile[0];

        if(file.size > 10 * 1024 * 1024)
        {
            toast.error("File too large");
            return;
        }

        try {
            setUploading(true)

            const data = await uploadToS3(file);
            console.log("data from file upload :", data)
            
            if(!data?.file_key || !data?.file_name)
            {
                toast.error("Something went wrong...");
                return;
            }

            mutate(data, {
                onSuccess: ( { chat_id } ) => {
                    toast.success("Chat created")
                    console.log("chat_id in file upload: ", chat_id);
                    router.push(`/chat/${chat_id}`);
                },
                onError: (err) => {
                    toast.error("error")
                    console.log(err);
                },
            })
        } catch (error) {
            console.log(error)
        } finally {
            setUploading(false)
        }
    }
  })

  return (
    <div className='p-2 bg-white rounded-xl'>
        <div
            {...getRootProps({
                className: 'border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex flex-col justify-center items-center'
            })}
        >
            <input {...getInputProps}/>
            {
                uploading || isLoading ?
                <>
                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                    <p className='mt-2 test-sm test-slate-400'>
                        Loading...
                    </p>
                </>
                :
                <>
                    <Inbox className='w-10 h-10 text-blue-500' />
                    <p className='mt-2 text-sm text-slate-400'>Drop/Upload PDF Here</p>
                </>
            }
        </div>
    </div>
  )
}

export default FileUpload