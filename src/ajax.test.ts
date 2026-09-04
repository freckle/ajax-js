import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import {
  ajaxCall,
  ajaxFormCall,
  ajaxFormFileUpload,
  ajaxJsonCall,
  appendParamToRemedyCorsBug,
  checkUrlExistence,
  sendBeacon
} from './ajax.js'

type AjaxOutcomeT = {resolve: unknown} | {reject: unknown}

// $.ajax returns a jqXHR, of which these helpers only use .then().fail().
function installAjaxMock(outcome: AjaxOutcomeT) {
  const ajax = vi.fn((_settings: JQuery.AjaxSettings) => ({
    then(onOk: (value: unknown) => void) {
      if ('resolve' in outcome) {
        onOk(outcome.resolve)
      }
      return {
        fail(onErr: (error: unknown) => void) {
          if ('reject' in outcome) {
            onErr(outcome.reject)
          }
        }
      }
    }
  }))

  ;(globalThis as {$?: JQueryStatic}).$ = {ajax} as unknown as JQueryStatic
  return ajax
}

afterEach(() => {
  delete (globalThis as {$?: JQueryStatic}).$
})

describe(ajaxCall.name, () => {
  test('resolves with the response body', async () => {
    installAjaxMock({resolve: {id: 1}})

    await expect(ajaxCall({url: '/3/students', method: 'GET', dataType: 'json'})).resolves.toEqual({
      id: 1
    })
  })

  test('rejects when the request fails', async () => {
    installAjaxMock({reject: new Error('boom')})

    await expect(ajaxCall({url: '/3/students', method: 'GET', dataType: 'json'})).rejects.toThrow(
      'boom'
    )
  })

  test('omits contentType and timeout when they are not given', async () => {
    const ajax = installAjaxMock({resolve: null})

    await ajaxCall({url: '/3/students', method: 'GET', dataType: 'json'})

    const settings = ajax.mock.calls[0][0]
    expect(settings).not.toHaveProperty('contentType')
    expect(settings).not.toHaveProperty('timeout')
  })

  test('forwards contentType and timeout when they are given', async () => {
    const ajax = installAjaxMock({resolve: null})

    await ajaxCall({
      url: '/3/students',
      method: 'POST',
      dataType: 'json',
      contentType: 'text/csv',
      timeout: 5000
    })

    expect(ajax.mock.calls[0][0]).toMatchObject({
      url: '/3/students',
      type: 'POST',
      contentType: 'text/csv',
      timeout: 5000
    })
  })
})

describe(ajaxJsonCall.name, () => {
  test('sends a JSON content type when there is a body', async () => {
    const ajax = installAjaxMock({resolve: null})

    await ajaxJsonCall({url: '/3/students', method: 'POST', data: '{"a":1}'})

    expect(ajax.mock.calls[0][0]).toMatchObject({
      contentType: 'application/json; charset=utf-8',
      dataType: 'json'
    })
  })

  test('omits the content type when there is no body, to avoid a CORS preflight', async () => {
    const ajax = installAjaxMock({resolve: null})

    await ajaxJsonCall({url: '/3/students', method: 'GET'})

    expect(ajax.mock.calls[0][0]).not.toHaveProperty('contentType')
  })
})

describe(ajaxFormCall.name, () => {
  test('sends form-urlencoded and disables caching', async () => {
    const ajax = installAjaxMock({resolve: null})

    await ajaxFormCall({url: '/3/session', method: 'POST', data: {email: 'a@b.c'}})

    expect(ajax.mock.calls[0][0]).toMatchObject({
      contentType: 'application/x-www-form-urlencoded',
      dataType: 'json',
      cache: false
    })
  })
})

describe(ajaxFormFileUpload.name, () => {
  test('lets jQuery pass FormData through untouched', async () => {
    const ajax = installAjaxMock({resolve: null})
    const data = new FormData()

    await ajaxFormFileUpload({url: '/3/imports', data})

    expect(ajax.mock.calls[0][0]).toMatchObject({
      type: 'POST',
      data,
      contentType: false,
      processData: false
    })
  })

  test('honours an explicit method and timeout', async () => {
    const ajax = installAjaxMock({resolve: null})

    await ajaxFormFileUpload({url: '/3/imports', data: new FormData(), method: 'PUT', timeout: 10})

    expect(ajax.mock.calls[0][0]).toMatchObject({type: 'PUT', timeout: 10})
  })

  test('rejects when the upload fails', async () => {
    installAjaxMock({reject: new Error('too large')})

    await expect(ajaxFormFileUpload({url: '/3/imports', data: new FormData()})).rejects.toThrow(
      'too large'
    )
  })
})

describe(checkUrlExistence.name, () => {
  test('is true when the HEAD request succeeds', async () => {
    installAjaxMock({resolve: ''})

    await expect(checkUrlExistence('/audio/a.mp3')).resolves.toBe(true)
  })

  test('is false when the HEAD request fails', async () => {
    installAjaxMock({reject: new Error('404')})

    await expect(checkUrlExistence('/audio/missing.mp3')).resolves.toBe(false)
  })
})

describe(sendBeacon.name, () => {
  let beacon: ReturnType<typeof vi.fn>

  beforeEach(() => {
    beacon = vi.fn()
    Object.defineProperty(window.navigator, 'sendBeacon', {value: beacon, configurable: true})
  })

  test('posts the payload as JSON', () => {
    sendBeacon({url: '/3/events', data: {name: 'click'}})

    expect(beacon).toHaveBeenCalledWith('/3/events', '{"name":"click"}')
  })

  test('swallows an unserializable payload', () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular

    expect(() => sendBeacon({url: '/3/events', data: circular})).not.toThrow()
    expect(beacon).not.toHaveBeenCalled()
  })
})

describe(appendParamToRemedyCorsBug.name, () => {
  test('starts a query string when the path has none', () => {
    expect(appendParamToRemedyCorsBug('/audio/a.mp3')).toBe('/audio/a.mp3?via=xmlHttpRequest')
  })

  test('extends an existing query string', () => {
    expect(appendParamToRemedyCorsBug('/audio/a.mp3?v=2')).toBe(
      '/audio/a.mp3?v=2&via=xmlHttpRequest'
    )
  })
})
