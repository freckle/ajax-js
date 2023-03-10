import isNil from 'lodash/isNil'
import {Parser, type ParserT} from '@freckle/parser'

export type LinkName = 'first' | 'previous' | 'next' | 'last'
export type LinkPathT = string

export function fromString(linkUrl: string): LinkPathT {
  return linkUrl
}

export function toString(linkUrl: LinkPathT): string {
  return linkUrl
}

export type LinksT = {
  [name in LinkName]: LinkPathT
}

/* Code Imported from https://gist.github.com/niallo/3109252
 * Allows us to read the Link Header and transform it in a usable object
 */

export function parseLinkHeader(linkHeader: string | null): LinksT {
  if (isNil(linkHeader) || linkHeader.trim().length === 0) {
    throw new Error('Expected non-zero Link header')
  }

  // Split parts by comma
  const parts = linkHeader.split(',')
  const links = {} as LinksT

  // Parse each part into a named link
  parts.forEach(part => {
    const section = part.split(';')
    if (section.length !== 2) {
      return
    }

    const url = section[0].replace(/<(.*)>/, '$1').trim()
    const rawName = section[1].replace(/rel="(.*)"/, '$1').trim()
    const name = toLinkName(rawName)
    links[name] = url
  })
  return links
}

const toLinkName = (rawName: string): LinkName => {
  switch (rawName) {
    case 'first':
    case 'previous':
    case 'next':
    case 'last':
      return rawName
    default:
      throw new Error(`Could not parse ${rawName}`)
  }
}

type ResponseT<T> = {
  response: T
  links: LinksT
}

export function fetchWithLinks<T>(url: string, parseAttrs: ParserT<T>): Promise<ResponseT<T>> {
  return new Promise((resolve, reject) => {
    $.ajax({
      url,
      type: 'GET'
    })
      .then((response, _textStatus, jqXHR) => {
        try {
          const linkHeader = jqXHR.getResponseHeader('Link')
          const links = parseLinkHeader(linkHeader)
          const parsedResponse = Parser.run(response, parseAttrs)
          resolve({response: parsedResponse, links})
        } catch (error) {
          reject(error)
        }
      })
      .fail((_jqXHR, _textStatus, errorThrown) => {
        reject(new Error(errorThrown))
      })
  })
}
