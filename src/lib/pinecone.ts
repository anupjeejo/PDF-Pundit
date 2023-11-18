import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from './s3-server';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { Document, RecursiveCharacterTextSplitter } from "@pinecone-database/doc-splitter" 
import md5 from 'md5'
import { getEmbedding } from './embeddings';
import { convertToAscii } from './utils';


export const getPineconeClient = async () => {
    return new Pinecone({
        environment: process.env.PINECONE_ENVIRONMENT!,
        apiKey: process.env.PINECONE_API_KEY!,
    })
}

type PDFPage = {
    pageContent: string;
    metadata: {
        loc: { pageNumber: number }
    }
}

export async function loadS3IntoPincone(fileKey: string) {
    //Retrive pdf from S3 and save on local file system
    console.log("downloading s3 into file system")
    const file_name = await downloadFromS3(fileKey);
    if(!file_name){
        throw new Error("Could not download file from S3.")
    }

    //Parse pdf flie and retrive its data
    const loader = new PDFLoader(file_name);
    const pages = await loader.load() as PDFPage[];

    //Split the pdf into segements
    const documents = await Promise.all(pages.map(prepareDocument));

    //Vectorize and embed individual docs
    const vectors = await Promise.all(documents.flat().map(embedDocument));

    //Uploading vectors to pincone
    const client = await getPineconeClient();
    
    const pineconeIndex = await client.Index('pdf-pundit')
    //const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
    console.log('inserting vectors into pincone');

    //await namespace.upsert(vectors);
    await pineconeIndex.upsert(vectors);
    //pinconeUtils.chunkedUpsert(pineconeIndex, vectors, namespace, 10)
    console.log('Insertion into pincone sucessful');
    return documents[0];
}

async function embedDocument(doc: Document){
    try {
        const embeddings = await getEmbedding(doc.pageContent)
        const hash = md5(doc.pageContent)

        return {
            id: hash,
            values: embeddings,
            metadata: {
                text: doc.metadata.text,
                pageNumber: doc.metadata.pageNumber
            }
        } as PineconeRecord
    } catch (error) {
        console.log('error while embeddibg documents', error);
        throw error;
    }
}

export const truncateStringBybytes = ( str: string, bytes: number) => {
    const enc = new TextEncoder();
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes))
} 


async function prepareDocument(page: PDFPage){
    let { pageContent, metadata } = page;
    pageContent = pageContent.replace(/\n/g, '');

    const splitter = new RecursiveCharacterTextSplitter();

    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata: {
                pagenumber: metadata.loc.pageNumber,
                text: truncateStringBybytes(pageContent, 36000) 
            }
        })
    ])

    return docs;
}