import {parseLinkHeader} from './link-header'

describe('parseLinkHeader', () => {
  test('should correctly return the link when only one is given', () => {
    const res = parseLinkHeader('</3/students?limit=10&schools.id=2>; rel="first"')
    expect(res).toEqual({first: '/3/students?limit=10&schools.id=2'})
  })

  test('should correctly return the link when several links are given', () => {
    const res = parseLinkHeader(
      '</3/students?limit=10&schools.id=2>; rel="first", </3/students?limit=10&position=94&schools.id=2>; rel="next"'
    )
    expect(res).toEqual({
      first: '/3/students?limit=10&schools.id=2',
      next: '/3/students?limit=10&position=94&schools.id=2'
    })
  })
})
