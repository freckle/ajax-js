import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import {ajaxFileDownload} from './ajax.js'

// Stands in for XMLHttpRequest so tests can drive onload/onerror by hand.
class FakeXhr {
  static last: FakeXhr | undefined

  status = 200
  statusText = 'OK'
  response: unknown = 'body'
  withCredentials = false
  responseType = ''
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  requestHeaders: Record<string, string> = {}
  responseHeaders: Record<string, string> = {}

  open = vi.fn()
  send = vi.fn()

  setRequestHeader = vi.fn((name: string, value: string) => {
    this.requestHeaders[name] = value
  })

  getResponseHeader = (name: string): string | null => this.responseHeaders[name] ?? null

  constructor() {
    FakeXhr.last = this
  }
}

const realXhr = globalThis.XMLHttpRequest

function download(disposition?: string) {
  const promise = ajaxFileDownload({
    url: '/3/exports/1',
    accept: 'text/csv',
    defaultFilename: 'fallback.csv'
  })

  const xhr = FakeXhr.last
  if (xhr === undefined) {
    throw new Error('ajaxFileDownload did not construct an XMLHttpRequest')
  }
  if (disposition !== undefined) {
    xhr.responseHeaders['Content-Disposition'] = disposition
  }
  xhr.responseHeaders['Content-Type'] = 'text/csv'

  return {promise, xhr}
}

describe('ajaxFileDownload', () => {
  let anchor: HTMLAnchorElement

  beforeEach(() => {
    FakeXhr.last = undefined
    globalThis.XMLHttpRequest = FakeXhr as unknown as typeof XMLHttpRequest

    // Keep a handle on the anchor the download builds, and stop jsdom from
    // trying to navigate to the data: URL when it is clicked.
    const createElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string, options?: unknown) => {
      const element = createElement(tagName, options as ElementCreationOptions | undefined)
      if (tagName === 'a') {
        anchor = element as HTMLAnchorElement
        anchor.click = vi.fn()
      }
      return element
    })
  })

  afterEach(() => {
    globalThis.XMLHttpRequest = realXhr
    vi.restoreAllMocks()
  })

  test('sends a credentialed blob request that accepts the requested type', () => {
    const {xhr} = download()

    expect(xhr.open).toHaveBeenCalledWith('GET', '/3/exports/1', true)
    expect(xhr.withCredentials).toBe(true)
    expect(xhr.responseType).toBe('blob')
    expect(xhr.requestHeaders).toEqual({Accept: 'text/csv'})
    expect(xhr.send).toHaveBeenCalled()
  })

  test('clicks a download anchor named from Content-Disposition', async () => {
    const {promise, xhr} = download('attachment; filename="students.csv"')

    xhr.onload?.()
    await promise

    expect(anchor.download).toBe('students.csv')
    expect(anchor.href.startsWith('data:')).toBe(true)
    expect(anchor.click).toHaveBeenCalled()
  })

  test('falls back to defaultFilename when Content-Disposition is absent', async () => {
    const {promise, xhr} = download()

    xhr.onload?.()
    await promise

    expect(anchor.download).toBe('fallback.csv')
  })

  test('falls back to defaultFilename when Content-Disposition is not an attachment', async () => {
    const {promise, xhr} = download('inline')

    xhr.onload?.()
    await promise

    expect(anchor.download).toBe('fallback.csv')
  })

  test('handles an empty response body', async () => {
    const {promise, xhr} = download()
    xhr.response = null

    xhr.onload?.()
    await promise

    expect(anchor.click).toHaveBeenCalled()
  })

  test('rejects on a non-2xx response', async () => {
    const {promise, xhr} = download()
    xhr.status = 404
    xhr.statusText = 'Not Found'

    xhr.onload?.()

    await expect(promise).rejects.toEqual({status: 404, statusText: 'Not Found'})
  })

  test('rejects on a transport error', async () => {
    const {promise, xhr} = download()
    xhr.status = 0
    xhr.statusText = ''

    xhr.onerror?.()

    await expect(promise).rejects.toEqual({status: 0, statusText: ''})
  })
})
