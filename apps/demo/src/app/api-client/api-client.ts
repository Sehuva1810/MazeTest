/* tslint:disable */
/* eslint-disable */
//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v13.11.1.0 (NJsonSchema v10.4.3.0 (Newtonsoft.Json v9.0.0.0)) (http://NSwag.org)
// </auto-generated>
//----------------------
// ReSharper disable InconsistentNaming

import { mergeMap as _observableMergeMap, catchError as _observableCatch } from 'rxjs/operators';
import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import { Injectable, Inject, Optional, InjectionToken } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';

export module ValantDemoApiClient {
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable()
export class Client {
    private http: HttpClient;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
        this.http = http;
        this.baseUrl = baseUrl !== undefined && baseUrl !== null ? baseUrl : "";
    }

    /**
     * @param file (optional) 
     * @return Success
     */
    upload(file: FileParameter | null | undefined): Observable<string> {
        let url_ = this.baseUrl + "/api/Maze/upload";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = new FormData();
        if (file !== null && file !== undefined)
            content_.append("file", file.data, file.fileName ? file.fileName : "file");

        let options_ : any = {
            body: content_,
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
                "Accept": "application/json"
            })
        };

        return this.http.request("post", url_, options_).pipe(_observableMergeMap((response_ : any) => {
            return this.processUpload(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processUpload(<any>response_);
                } catch (e) {
                    return <Observable<string>><any>_observableThrow(e);
                }
            } else
                return <Observable<string>><any>_observableThrow(response_);
        }));
    }

    protected processUpload(response: HttpResponseBase): Observable<string> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (<any>response).error instanceof Blob ? (<any>response).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            let result200: any = null;
            result200 = _responseText === "" ? null : <string>JSON.parse(_responseText, this.jsonParseReviver);
            return _observableOf(result200);
            }));
        } else if (status === 400) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            let result400: any = null;
            result400 = _responseText === "" ? null : <ProblemDetails>JSON.parse(_responseText, this.jsonParseReviver);
            return throwException("Bad Request", status, _responseText, _headers, result400);
            }));
        } else if (status === 500) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            let result500: any = null;
            result500 = _responseText === "" ? null : <ProblemDetails>JSON.parse(_responseText, this.jsonParseReviver);
            return throwException("Server Error", status, _responseText, _headers, result500);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf<string>(<any>null);
    }

    /**
     * @return Success
     */
    available(): Observable<MazeDefinition[]> {
        let url_ = this.baseUrl + "/api/Maze/available";
        url_ = url_.replace(/[?&]$/, "");

        let options_ : any = {
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
                "Accept": "application/json"
            })
        };

        return this.http.request("get", url_, options_).pipe(_observableMergeMap((response_ : any) => {
            return this.processAvailable(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processAvailable(<any>response_);
                } catch (e) {
                    return <Observable<MazeDefinition[]>><any>_observableThrow(e);
                }
            } else
                return <Observable<MazeDefinition[]>><any>_observableThrow(response_);
        }));
    }

    protected processAvailable(response: HttpResponseBase): Observable<MazeDefinition[]> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (<any>response).error instanceof Blob ? (<any>response).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            let result200: any = null;
            result200 = _responseText === "" ? null : <MazeDefinition[]>JSON.parse(_responseText, this.jsonParseReviver);
            return _observableOf(result200);
            }));
        } else if (status === 500) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            let result500: any = null;
            result500 = _responseText === "" ? null : <ProblemDetails>JSON.parse(_responseText, this.jsonParseReviver);
            return throwException("Server Error", status, _responseText, _headers, result500);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf<MazeDefinition[]>(<any>null);
    }

    /**
     * @return Success
     */
    initialize(mazeId: string | null): Observable<GameState> {
        let url_ = this.baseUrl + "/api/Maze/initialize/{mazeId}";
        if (mazeId === undefined || mazeId === null)
            throw new Error("The parameter 'mazeId' must be defined.");
        url_ = url_.replace("{mazeId}", encodeURIComponent("" + mazeId));
        url_ = url_.replace(/[?&]$/, "");

        let options_ : any = {
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
                "Accept": "application/json"
            })
        };

        return this.http.request("post", url_, options_).pipe(_observableMergeMap((response_ : any) => {
            return this.processInitialize(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processInitialize(<any>response_);
                } catch (e) {
                    return <Observable<GameState>><any>_observableThrow(e);
                }
            } else
                return <Observable<GameState>><any>_observableThrow(response_);
        }));
    }

    protected processInitialize(response: HttpResponseBase): Observable<GameState> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (<any>response).error instanceof Blob ? (<any>response).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            let result200: any = null;
            result200 = _responseText === "" ? null : <GameState>JSON.parse(_responseText, this.jsonParseReviver);
            return _observableOf(result200);
            }));
        } else if (status === 404) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            let result404: any = null;
            result404 = _responseText === "" ? null : <ProblemDetails>JSON.parse(_responseText, this.jsonParseReviver);
            return throwException("Not Found", status, _responseText, _headers, result404);
            }));
        } else if (status === 500) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            let result500: any = null;
            result500 = _responseText === "" ? null : <ProblemDetails>JSON.parse(_responseText, this.jsonParseReviver);
            return throwException("Server Error", status, _responseText, _headers, result500);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf<GameState>(<any>null);
    }

    /**
     * @param body (optional) 
     * @return Success
     */
    move(sessionId: string | null, body: Direction | undefined): Observable<GameState> {
        let url_ = this.baseUrl + "/api/Maze/move/{sessionId}";
        if (sessionId === undefined || sessionId === null)
            throw new Error("The parameter 'sessionId' must be defined.");
        url_ = url_.replace("{sessionId}", encodeURIComponent("" + sessionId));
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_ : any = {
            body: content_,
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
                "Content-Type": "application/json",
                "Accept": "application/json"
            })
        };

        return this.http.request("post", url_, options_).pipe(_observableMergeMap((response_ : any) => {
            return this.processMove(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processMove(<any>response_);
                } catch (e) {
                    return <Observable<GameState>><any>_observableThrow(e);
                }
            } else
                return <Observable<GameState>><any>_observableThrow(response_);
        }));
    }

    protected processMove(response: HttpResponseBase): Observable<GameState> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (<any>response).error instanceof Blob ? (<any>response).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            let result200: any = null;
            result200 = _responseText === "" ? null : <GameState>JSON.parse(_responseText, this.jsonParseReviver);
            return _observableOf(result200);
            }));
        } else if (status === 400) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            let result400: any = null;
            result400 = _responseText === "" ? null : <ProblemDetails>JSON.parse(_responseText, this.jsonParseReviver);
            return throwException("Bad Request", status, _responseText, _headers, result400);
            }));
        } else if (status === 404) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            let result404: any = null;
            result404 = _responseText === "" ? null : <ProblemDetails>JSON.parse(_responseText, this.jsonParseReviver);
            return throwException("Not Found", status, _responseText, _headers, result404);
            }));
        } else if (status === 500) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            let result500: any = null;
            result500 = _responseText === "" ? null : <ProblemDetails>JSON.parse(_responseText, this.jsonParseReviver);
            return throwException("Server Error", status, _responseText, _headers, result500);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf<GameState>(<any>null);
    }

    /**
     * @return Success
     */
    clear(): Observable<void> {
        let url_ = this.baseUrl + "/api/Maze/clear";
        url_ = url_.replace(/[?&]$/, "");

        let options_ : any = {
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
            })
        };

        return this.http.request("delete", url_, options_).pipe(_observableMergeMap((response_ : any) => {
            return this.processClear(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processClear(<any>response_);
                } catch (e) {
                    return <Observable<void>><any>_observableThrow(e);
                }
            } else
                return <Observable<void>><any>_observableThrow(response_);
        }));
    }

    protected processClear(response: HttpResponseBase): Observable<void> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (<any>response).error instanceof Blob ? (<any>response).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
        if (status === 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            return _observableOf<void>(<any>null);
            }));
        } else if (status === 500) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            let result500: any = null;
            result500 = _responseText === "" ? null : <ProblemDetails>JSON.parse(_responseText, this.jsonParseReviver);
            return throwException("Server Error", status, _responseText, _headers, result500);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf<void>(<any>null);
    }

    /**
     * @return Success
     */
    directions(): Observable<string[]> {
        let url_ = this.baseUrl + "/api/Maze/directions";
        url_ = url_.replace(/[?&]$/, "");

        let options_ : any = {
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
                "Accept": "application/json"
            })
        };

        return this.http.request("get", url_, options_).pipe(_observableMergeMap((response_ : any) => {
            return this.processDirections(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processDirections(<any>response_);
                } catch (e) {
                    return <Observable<string[]>><any>_observableThrow(e);
                }
            } else
                return <Observable<string[]>><any>_observableThrow(response_);
        }));
    }

    protected processDirections(response: HttpResponseBase): Observable<string[]> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (<any>response).error instanceof Blob ? (<any>response).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            let result200: any = null;
            result200 = _responseText === "" ? null : <string[]>JSON.parse(_responseText, this.jsonParseReviver);
            return _observableOf(result200);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf<string[]>(<any>null);
    }
}

export interface ProblemDetails {
    type?: string | undefined;
    title?: string | undefined;
    status?: number | undefined;
    detail?: string | undefined;
    instance?: string | undefined;
}

export interface Position {
    x?: number;
    y?: number;
}

export interface MazeDefinition {
    id?: string | undefined;
    name?: string | undefined;
    grid?: string | undefined;
    start?: Position;
    exit?: Position;
}

export enum Direction {
    _0 = 0,
    _1 = 1,
    _2 = 2,
    _3 = 3,
}

export interface GameState {
    sessionId?: string | undefined;
    mazeId?: string | undefined;
    currentPosition?: Position;
    isComplete?: boolean;
    availableMoves?: Direction[] | undefined;
}

export interface FileParameter {
    data: any;
    fileName: string;
}

export class ApiException extends Error {
    message: string;
    status: number;
    response: string;
    headers: { [key: string]: any; };
    result: any;

    constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
        super();

        this.message = message;
        this.status = status;
        this.response = response;
        this.headers = headers;
        this.result = result;
    }

    protected isApiException = true;

    static isApiException(obj: any): obj is ApiException {
        return obj.isApiException === true;
    }
}

function throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): Observable<any> {
    if (result !== null && result !== undefined)
        return _observableThrow(result);
    else
        return _observableThrow(new ApiException(message, status, response, headers, null));
}

function blobToText(blob: any): Observable<string> {
    return new Observable<string>((observer: any) => {
        if (!blob) {
            observer.next("");
            observer.complete();
        } else {
            let reader = new FileReader();
            reader.onload = event => {
                observer.next((<any>event.target).result);
                observer.complete();
            };
            reader.readAsText(blob);
        }
    });
}

}