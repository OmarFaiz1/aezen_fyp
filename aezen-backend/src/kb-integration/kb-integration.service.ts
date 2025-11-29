import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';
import { Multer } from 'multer'; // Ensure this type is available or use Express.Multer.File with proper setup

@Injectable()
export class KbIntegrationService {
    private fastApiUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.fastApiUrl = this.configService.get<string>('FASTAPI_URL') || 'http://127.0.0.1:8000';
    }

    async ingestDocument(tenantId: string, file: Express.Multer.File) {
        console.log(`[KbService] Sending document to FastAPI: ${file.originalname} (Size: ${file.size})`);
        try {
            const formData = new FormData();
            formData.append('tenant_id', tenantId);
            formData.append('file', file.buffer, file.originalname);

            const response = await firstValueFrom(
                this.httpService.post(`${this.fastApiUrl}/ingest/document`, formData, {
                    headers: {
                        ...formData.getHeaders(),
                    },
                }),
            );
            return response.data;
        } catch (error) {
            console.error('Error ingesting document:', error.response?.data || error.message);
            throw new HttpException(
                error.response?.data?.detail || 'Failed to ingest document',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async ingestUrl(tenantId: string, url: string) {
        try {
            const formData = new FormData();
            formData.append('tenant_id', tenantId);
            formData.append('url', url);

            const response = await firstValueFrom(
                this.httpService.post(`${this.fastApiUrl}/ingest/url`, formData, {
                    headers: formData.getHeaders(),
                }),
            );
            return response.data;
        } catch (error) {
            console.error('Error ingesting URL:', error.response?.data || error.message);
            throw new HttpException(
                error.response?.data?.detail || 'Failed to ingest URL',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async queryBot(tenantId: string, userId: string, query: string) {
        try {
            const formData = new FormData();
            formData.append('tenant_id', tenantId);
            formData.append('user_id', userId);
            formData.append('query', query);

            const response = await firstValueFrom(
                this.httpService.post(`${this.fastApiUrl}/query`, formData, {
                    headers: formData.getHeaders(),
                }),
            );
            return response.data;
        } catch (error) {
            console.error('Error querying bot:', error.response?.data || error.message);
            // Don't throw, just return null or error message so chat doesn't break
            return { answer: "Sorry, I'm having trouble connecting to my brain right now." };
        }
    }

    async getStatus(tenantId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.fastApiUrl}/status/${tenantId}`),
            );
            return response.data;
        } catch (error) {
            console.error('Error getting status:', error.response?.data || error.message);
            return { files: [], websites: [] };
        }
    }

    async deleteDocument(tenantId: string, sourceId: string) {
        const url = `${this.fastApiUrl}/delete`;
        const formData = new FormData();
        formData.append('tenant_id', tenantId);
        formData.append('source_id', sourceId);

        try {
            const response = await firstValueFrom(
                this.httpService.delete(url, {
                    data: formData, // axios delete with body needs 'data' or specific config
                    headers: { ...formData.getHeaders() }
                })
            );
            return response.data;
        } catch (error) {
            console.error(`Error deleting document for tenant ${tenantId}:`, error.message);
            throw error;
        }
    }
}
