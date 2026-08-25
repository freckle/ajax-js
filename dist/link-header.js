"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromString = fromString;
exports.toString = toString;
exports.parseLinkHeader = parseLinkHeader;
function fromString(linkUrl) {
    return linkUrl;
}
function toString(linkUrl) {
    return linkUrl;
}
/* Code Imported from https://gist.github.com/niallo/3109252
 * Allows us to read the Link Header and transform it in a usable object
 */
function parseLinkHeader(linkHeader) {
    if (linkHeader == null || linkHeader.trim().length === 0) {
        throw new Error('Expected non-zero Link header');
    }
    // Split parts by comma
    const parts = linkHeader.split(',');
    const links = {};
    // Parse each part into a named link
    parts.forEach(part => {
        const section = part.split(';');
        if (section.length !== 2) {
            return;
        }
        const url = section[0].replace(/<(.*)>/, '$1').trim();
        const rawName = section[1].replace(/rel="(.*)"/, '$1').trim();
        const name = toLinkName(rawName);
        links[name] = url;
    });
    return links;
}
const toLinkName = (rawName) => {
    switch (rawName) {
        case 'first':
        case 'previous':
        case 'next':
        case 'last':
            return rawName;
        default:
            throw new Error(`Could not parse ${rawName}`);
    }
};
