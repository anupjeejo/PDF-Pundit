import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbedding } from "./embeddings";

export async function getMatchesFromEmbeddings(
    embeddings: number[],
    fileKey: string
  ) {
    try {
      console.log('querying embeddings 1')
      const client = new Pinecone({
        environment: process.env.PINECONE_ENVIRONMENT!,
        apiKey: process.env.PINECONE_API_KEY!,
      });
      console.log('querying embeddings 2')
      const pineconeIndex = await client.index("pdf-pundit");
      console.log('querying embeddings 3')
      console.log("fileKey: ", fileKey)
      //const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
      //console.log("namespace: ", namespace)
      console.log('querying embeddings 4')
      // const queryResult = await namespace.query({
      //   topK: 5,  
      //   vector: embeddings,
      //   includeMetadata: true,
      // });

      // const queryResult = await pineconeIndex.query({
      //   vector: embeddings,
      //   topK: 5,
      //   includeMetadata: true,
      // })

      const queryResult = await pineconeIndex.query({
        vector: embeddings,
        filter: { fileKey: { $eq: fileKey } },
        topK: 5,
        includeMetadata: true,
      })

      console.log("queryResult: ", queryResult)
      console.log('querying embeddings 5')

      return queryResult.matches || [];
    } catch (error) {
      console.log("error querying embeddings", error);
      throw error;
    }
  }

  export async function getContext(query: string, fileKey: string) {
    console.log("getContext-1")
    const queryEmbeddings = await getEmbedding(query);
    console.log("getContext-2")
    const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);
  
    console.log("getContext-3")
    const qualifyingDocs = matches.filter(
      (match) => match.score && match.score > 0.7
    );
  
    console.log("getContext-4")
    type Metadata = {
      text: string;
      pageNumber: number;
    };
  
    console.log("getContext-5")
    let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);

    console.log("getContext docs: ", docs)
    console.log("getContext-6")
    // 5 vectors
    return docs.join("\n").substring(0, 3000);
  }