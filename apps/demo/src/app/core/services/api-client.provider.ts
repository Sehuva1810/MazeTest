import { Provider } from '@angular/core';
import { ValantDemoApiClient } from '../../api-client/api-client';

export const API_BASE_URL = 'http://localhost:5000';

export const API_CLIENT_PROVIDERS: Provider[] = [
    ValantDemoApiClient.Client,
    { provide: ValantDemoApiClient.API_BASE_URL, useValue: API_BASE_URL }
];
