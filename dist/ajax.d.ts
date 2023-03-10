type MethodT = 'POST' | 'GET' | 'PATCH' | 'PUT' | 'HEAD' | 'DELETE';
type ContentTypeT = 'application/json; charset=utf-8' | 'application/x-www-form-urlencoded' | 'text/plain' | 'text/csv';
type DataTypeT = 'json' | 'text';
type AjaxCallOptionsT = {
    url: string;
    method: MethodT;
    data?: any;
    contentType?: ContentTypeT | null;
    dataType: DataTypeT;
    cache?: boolean;
    xhrFields?: {
        withCredentials: boolean;
    };
    timeout?: number;
};
export declare function ajaxCall<T>(options: AjaxCallOptionsT): Promise<T>;
type MethodWithStringifiedDataT = 'POST' | 'PATCH' | 'PUT' | 'HEAD' | 'DELETE';
type MethodWithRawDataT = 'GET';
export type AjaxJsonCallOptionsT = {
    url: string;
    method: MethodWithStringifiedDataT;
    data?: string;
    cache?: boolean;
    xhrFields?: {
        withCredentials: boolean;
    };
    timeout?: number;
} | {
    url: string;
    method: MethodWithRawDataT;
    data?: any;
    cache?: boolean;
    xhrFields?: {
        withCredentials: boolean;
    };
    timeout?: number;
};
export declare function ajaxJsonCall<T>(options: AjaxJsonCallOptionsT): Promise<T>;
type AjaxFormCallOptionsT = {
    url: string;
    method: MethodT;
    data?: any;
};
export declare function ajaxFormCall<T>(options: AjaxFormCallOptionsT): Promise<T>;
type AjaxFormFileUploadOptionsT = {
    url: string;
    data: any;
    method?: MethodT;
    timeout?: number;
};
export declare function ajaxFormFileUpload<T>(options: AjaxFormFileUploadOptionsT): Promise<T>;
export type AjaxFileDownloadOptionsT = {
    url: string;
    accept: ContentTypeT;
    defaultFilename: string;
};
export declare function ajaxFileDownload(options: AjaxFileDownloadOptionsT): Promise<void>;
type SendBeaconOptionsT = Inexact<{
    url: string;
    data: Inexact<{
        [x: string]: any;
    }>;
}>;
export declare function sendBeacon(options: SendBeaconOptionsT): void;
export declare function checkUrlExistence(url: string): Promise<boolean>;
/**
 * This hack gets around a Chrome caching bug wherein the audio request generated
 * by the audio web api leads to chrome caching a response that does not contain
 * the appropriate CORS headers.  Any subsequent testing of that resource by this method
 * would then attempt to fetch the resource from cache and would error out with a missing
 * access-control-allow-origin error.  By appending the path name to the audioPath
 * here, but not for the audio web api, we create a separate cache for this
 * resource request and bypass using the cached response with the missing
 * CORS Headers.  This is reproducible in Chrome only.
 *
 * Root cause: https://bugs.chromium.org/p/chromium/issues/detail?id=260239
 */
export declare function appendParamToRemedyCorsBug(path: string): string;
export {};
