export type LinkName = 'first' | 'previous' | 'next' | 'last';
export type LinkPathT = string;
export declare function fromString(linkUrl: string): LinkPathT;
export declare function toString(linkUrl: LinkPathT): string;
export type LinksT = {
    [name in LinkName]: LinkPathT;
};
export declare function parseLinkHeader(linkHeader: string | null): LinksT;
