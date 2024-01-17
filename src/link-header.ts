import isNil from 'lodash/isNil'

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
