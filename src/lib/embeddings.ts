import { OpenAIApi, Configuration } from 'openai-edge'

const config = new Configuration({
    apiKey: process.env.OPENAI_AP_KEY
})

const openai = new OpenAIApi(config);

export async function getEmbedding(text: string){
    try {
        const response = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: text.replace(/\n/g, " "),
        });
        console.log("response from getEmbedding: ", response)
        const result = await response.json();
        console.log("result from getEmbedding:", result)
        return result.data[0].embedding as number[]
    } catch (error) {
        console.log('error while calling openai embeddibgs api', error);
        throw error;
    }
}