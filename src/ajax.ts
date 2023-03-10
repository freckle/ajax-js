import {fromMaybe, mthen} from '@freckle/maybe'

type MethodT = 'POST' | 'GET' | 'PATCH' | 'PUT' | 'HEAD' | 'DELETE'
type ContentTypeT =
  | 'application/json; charset=utf-8'
  | 'application/x-www-form-urlencoded'
  | 'text/plain'
  | 'text/csv'
type DataTypeT = 'json' | 'text'

type AjaxCallOptionsT = {
  url: string
  method: MethodT
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  contentType?: ContentTypeT | null
  dataType: DataTypeT
  cache?: boolean
  xhrFields?: {
    withCredentials: boolean
  }
  timeout?: number
}

export function ajaxCall<T>(options: AjaxCallOptionsT): Promise<T> {
  const {url, method, data, contentType, dataType, cache, xhrFields, timeout} = options
  const contentTypeHeader = contentType !== null && contentType !== undefined ? {contentType} : {}
  const timeoutParam = timeout !== null && timeout !== undefined ? {timeout} : {}

  return new Promise((resolve, reject) => {
    $.ajax({
      url,
      type: method,
      data,
      dataType,
      cache,
      xhrFields,
      ...timeoutParam,
      ...contentTypeHeader
    })
      .then(resolve)
      .fail(reject)
  })
}

type MethodWithStringifiedDataT = 'POST' | 'PATCH' | 'PUT' | 'HEAD' | 'DELETE'
type MethodWithRawDataT = 'GET'

export type AjaxJsonCallOptionsT =
  | {
      url: string
      method: MethodWithStringifiedDataT
      data?: string
      cache?: boolean
      xhrFields?: {
        withCredentials: boolean
      }
      timeout?: number
    }
  | {
      url: string
      method: MethodWithRawDataT
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?: any
      cache?: boolean
      xhrFields?: {
        withCredentials: boolean
      }
      timeout?: number
    }

export function ajaxJsonCall<T>(options: AjaxJsonCallOptionsT): Promise<T> {
  const {url, method, data, cache, xhrFields, timeout} = options
  // If we are not sending any data along with the request then there is no need to specify the contentType
  // For cross-domain requests, setting the content type to anything other than application/x-www-form-urlencoded,
  // multipart/form-data, or text/plain will trigger the browser to send a preflight OPTIONS request to the server.
  // We don't want to make a preflight request where it has no use.
  const contentType = data !== null && data !== undefined ? 'application/json; charset=utf-8' : null
  const dataType = 'json'
  return ajaxCall({url, method, data, contentType, dataType, cache, xhrFields, timeout})
}

type AjaxFormCallOptionsT = {
  url: string
  method: MethodT
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
}

export function ajaxFormCall<T>(options: AjaxFormCallOptionsT): Promise<T> {
  const {url, method, data} = options
  const contentType = 'application/x-www-form-urlencoded'
  const dataType = 'json'
  const cache = false
  return ajaxCall({url, method, data, contentType, dataType, cache})
}

type AjaxFormFileUploadOptionsT = {
  url: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  method?: MethodT
  timeout?: number
}

export function ajaxFormFileUpload<T>(options: AjaxFormFileUploadOptionsT): Promise<T> {
  const {url, data, method, timeout} = options
  const timeoutParam = timeout !== null && timeout !== undefined ? {timeout} : {}
  return new Promise((resolve, reject) => {
    $.ajax({
      url,
      type: method ? method : 'POST',
      data,
      contentType: false,
      processData: false,
      ...timeoutParam
    })
      .then(resolve)
      .fail(reject)
  })
}

export type AjaxFileDownloadOptionsT = {
  url: string
  accept: ContentTypeT
  defaultFilename: string
}

export function ajaxFileDownload(options: AjaxFileDownloadOptionsT): Promise<void> {
  const {url, accept, defaultFilename} = options
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.withCredentials = true
    request.responseType = 'blob'
    request.setRequestHeader('Accept', accept)

    // Reject on error
    request.onerror = () => {
      reject({
        status: request.status,
        statusText: request.statusText
      })
    }

    // Create an anchor that downloads Blob using FileReader
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        const contentType = request.getResponseHeader('Content-Type')
        const disposition = request.getResponseHeader('Content-Disposition')
        const blob = new Blob([request.response ?? ''], {type: contentType ?? undefined})
        const reader = new FileReader()
        reader.onload = e => {
          const anchor = document.createElement('a')
          anchor.style.display = 'none'

          const target = e.target
          if (target instanceof FileReader && typeof target.result === 'string') {
            anchor.href = target.result
            anchor.download = fromMaybe(
              () => defaultFilename,
              contentDispositionFilename(disposition)
            )
            anchor.click()
            resolve()
          } else {
            reject({
              status: request.status,
              statusText: request.statusText
            })
          }
        }
        reader.readAsDataURL(blob)
      } else {
        reject({
          status: request.status,
          statusText: request.statusText
        })
      }
    }

    // Go
    request.send()
  })
}

function contentDispositionFilename(mDisposition?: string | null): string | undefined | null {
  return mthen(mDisposition, disposition =>
    mthen(
      disposition.trim().match(/attachment; filename="(.*)"/),
      ([_ignore, filename]) => filename
    )
  )
}

type SendBeaconOptionsT = Inexact<{
  url: string
  data: Inexact<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [x: string]: any
  }> // Object to stringify
}>

export function sendBeacon(options: SendBeaconOptionsT) {
  const {url, data} = options

  try {
    const jsonData = JSON.stringify(data)
    window.navigator.sendBeacon(url, jsonData)
    // eslint-disable-next-line no-empty
  } catch (e) {}
}

export function checkUrlExistence(url: string): Promise<boolean> {
  return new Promise(resolve => {
    ajaxCall({
      url,
      method: 'HEAD',
      contentType: 'text/plain',
      dataType: 'text'
    })
      .then(() => {
        resolve(true)
      })
      .catch(() => {
        resolve(false)
      })
  })
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
export function appendParamToRemedyCorsBug(path: string): string {
  return path.includes('?') ? `${path}&via=xmlHttpRequest` : `${path}?via=xmlHttpRequest`
}
