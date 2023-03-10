import { type ParserT } from '@freckle/parser';
export type LinkName = 'first' | 'previous' | 'next' | 'last';
export type LinkPathT = string;
export declare function fromString(linkUrl: string): LinkPathT;
export declare function toString(linkUrl: LinkPathT): string;
export type LinksT = {
    [name in LinkName]: LinkPathT;
};
export declare function parseLinkHeader(linkHeader: string | null): LinksT;
type ResponseT<T> = {
    response: T;
    links: LinksT;
};
export declare function fetchWithLinks<T>(url: string, parseAttrs: ParserT<T>): Promise<ResponseT<T>>;
export {};
