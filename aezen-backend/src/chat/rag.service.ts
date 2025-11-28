import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RAGService {
    private readonly fastApiUrl = 'http://localhost:8000'; // External FastAPI URL

    async queryFastAPI(message: string, kbPointer: string): Promise<{ response: string; metadata: any }> {
        try {
            const response = await axios.post(`${this.fastApiUrl}/rag/query`, {
                query: message,
                kb_pointer: kbPointer,
            });
            return {
                response: response.data.answer,
                metadata: response.data.sources,
            };
        } catch (error) {
            console.error('Error querying RAG service:', error);
            return {
                response: 'I am having trouble connecting to my knowledge base right now.',
                metadata: null,
            };
        }
    }
}
