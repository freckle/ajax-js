"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ajaxCall = ajaxCall;
exports.ajaxJsonCall = ajaxJsonCall;
exports.ajaxFormCall = ajaxFormCall;
exports.ajaxFormFileUpload = ajaxFormFileUpload;
exports.ajaxFileDownload = ajaxFileDownload;
exports.sendBeacon = sendBeacon;
exports.checkUrlExistence = checkUrlExistence;
exports.appendParamToRemedyCorsBug = appendParamToRemedyCorsBug;
const maybe_1 = require("@freckle/maybe");
function ajaxCall(options) {
    const { url, method, data, contentType, dataType, cache, xhrFields, timeout } = options;
    const contentTypeHeader = contentType !== null && contentType !== undefined ? { contentType } : {};
    const timeoutParam = timeout !== null && timeout !== undefined ? { timeout } : {};
    return new Promise((resolve, reject) => {
        $.ajax(Object.assign(Object.assign({ url, type: method, data,
            dataType,
            cache,
            xhrFields }, timeoutParam), contentTypeHeader))
            .then(resolve)
            .fail(reject);
    });
}
function ajaxJsonCall(options) {
    const { url, method, data, cache, xhrFields, timeout } = options;
    // If we are not sending any data along with the request then there is no need to specify the contentType
    // For cross-domain requests, setting the content type to anything other than application/x-www-form-urlencoded,
    // multipart/form-data, or text/plain will trigger the browser to send a preflight OPTIONS request to the server.
    // We don't want to make a preflight request where it has no use.
    const contentType = data !== null && data !== undefined ? 'application/json; charset=utf-8' : null;
    const dataType = 'json';
    return ajaxCall({ url, method, data, contentType, dataType, cache, xhrFields, timeout });
}
function ajaxFormCall(options) {
    const { url, method, data } = options;
    const contentType = 'application/x-www-form-urlencoded';
    const dataType = 'json';
    const cache = false;
    return ajaxCall({ url, method, data, contentType, dataType, cache });
}
function ajaxFormFileUpload(options) {
    const { url, data, method, timeout } = options;
    const timeoutParam = timeout !== null && timeout !== undefined ? { timeout } : {};
    return new Promise((resolve, reject) => {
        $.ajax(Object.assign({ url, type: method ? method : 'POST', data, contentType: false, processData: false }, timeoutParam))
            .then(resolve)
            .fail(reject);
    });
}
function ajaxFileDownload(options) {
    const { url, accept, defaultFilename } = options;
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.withCredentials = true;
        request.responseType = 'blob';
        request.setRequestHeader('Accept', accept);
        // Reject on error
        request.onerror = () => {
            reject({
                status: request.status,
                statusText: request.statusText
            });
        };
        // Create an anchor that downloads Blob using FileReader
        request.onload = () => {
            var _a;
            if (request.status >= 200 && request.status < 300) {
                const contentType = request.getResponseHeader('Content-Type');
                const disposition = request.getResponseHeader('Content-Disposition');
                const blob = new Blob([(_a = request.response) !== null && _a !== void 0 ? _a : ''], { type: contentType !== null && contentType !== void 0 ? contentType : undefined });
                const reader = new FileReader();
                reader.onload = e => {
                    const anchor = document.createElement('a');
                    anchor.style.display = 'none';
                    const target = e.target;
                    if (target instanceof FileReader && typeof target.result === 'string') {
                        anchor.href = target.result;
                        anchor.download = (0, maybe_1.fromMaybe)(() => defaultFilename, contentDispositionFilename(disposition));
                        anchor.click();
                        resolve();
                    }
                    else {
                        reject({
                            status: request.status,
                            statusText: request.statusText
                        });
                    }
                };
                reader.readAsDataURL(blob);
            }
            else {
                reject({
                    status: request.status,
                    statusText: request.statusText
                });
            }
        };
        // Go
        request.send();
    });
}
function contentDispositionFilename(mDisposition) {
    return (0, maybe_1.mthen)(mDisposition, disposition => (0, maybe_1.mthen)(disposition.trim().match(/attachment; filename="(.*)"/), ([_ignore, filename]) => filename));
}
function sendBeacon(options) {
    const { url, data } = options;
    try {
        const jsonData = JSON.stringify(data);
        window.navigator.sendBeacon(url, jsonData);
        // eslint-disable-next-line no-empty
    }
    catch (e) { }
}
function checkUrlExistence(url) {
    return new Promise(resolve => {
        ajaxCall({
            url,
            method: 'HEAD',
            contentType: 'text/plain',
            dataType: 'text'
        })
            .then(() => {
            resolve(true);
        })
            .catch(() => {
            resolve(false);
        });
    });
}
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
function appendParamToRemedyCorsBug(path) {
    return path.includes('?') ? `${path}&via=xmlHttpRequest` : `${path}?via=xmlHttpRequest`;
}
