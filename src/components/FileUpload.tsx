'use client'

import { uploadToS3 } from '@/lib/s3';
import { Inbox } from 'lucide-react';
import React from 'react'
import { useDropzone } from 'react-dropzone'

function FileUpload() {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (uploadedFile) => {
        console.log(uploadedFile);
        const file = uploadedFile[0];

        if(file.size > 10 * 1024 * 1024)
        {
            alert('Please upload file smaller than 10mb');
            return
        }

        try {
            const data = await uploadToS3(file);
            console.log("data from file upload :", data)
        } catch (error) {
            console.log(error)
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
            <>
                <Inbox className='w-10 h-10 text-blue-500' />
                <p className='mt-2 text-sm text-slate-400'>Drop/Upload PDF Here</p>
            </>
        </div>
    </div>
  )
}

export default FileUpload