import kebabCase from 'lodash/kebabCase'

export type MyType = {data: string}

export const process = (input: MyType): string => kebabCase(input.data)
