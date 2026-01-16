import type { PaginationRequest } from './common.types';

export interface Location {
    id: string;
    name: string;
    province: string;
    routes: string;
    image: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLocationPayload {
    name: string;
    province: string;
    routes: string;
    image: string;
    description?: string;
}

export interface UpdateLocationPayload extends Partial<CreateLocationPayload> { }

export interface LocationListParams extends PaginationRequest {
    search?: string;
}
