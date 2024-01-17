"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLinkHeader = exports.toString = exports.fromString = void 0;
const isNil_1 = __importDefault(require("lodash/isNil"));
function fromString(linkUrl) {
    return linkUrl;
}
exports.fromString = fromString;
function toString(linkUrl) {
    return linkUrl;
}
exports.toString = toString;
/* Code Imported from https://gist.github.com/niallo/3109252
 * Allows us to read the Link Header and transform it in a usable object
 */
function parseLinkHeader(linkHeader) {
    if ((0, isNil_1.default)(linkHeader) || linkHeader.trim().length === 0) {
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
exports.parseLinkHeader = parseLinkHeader;
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
