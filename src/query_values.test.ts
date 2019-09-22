import {
  parseBoolQueryValue,
  parseIntQueryValue,
  parseEnumQueryValue,
  SearchParamError,
} from './query_values'

describe('parseBoolQueryValue', () => {
  it('returns true for 1', () => {
    expect(parseBoolQueryValue({ foo: '1' }, 'foo')).toBe(true)
  })

  it('returns true for true', () => {
    expect(parseBoolQueryValue({ foo: 'true' }, 'foo')).toBe(true)
  })

  it('returns false for 0', () => {
    expect(parseBoolQueryValue({ foo: '0' }, 'foo')).toBe(false)
  })

  it('returns false for false', () => {
    expect(parseBoolQueryValue({ foo: 'false' }, 'foo')).toBe(false)
  })

  it('returns true for undefined params', () => {
    expect(parseBoolQueryValue({ foo: undefined }, 'foo')).toBe(true)
  })

  it('throws for mulitple values', () => {
    expect(() =>
      parseBoolQueryValue({ foo: ['foo', 'bar'] }, 'foo'),
    ).toThrowError(SearchParamError)

    expect(() =>
      parseBoolQueryValue({ foo: ['foo', 'bar'] }, 'foo'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"invalid search param [foo]: expected a single value"`,
    )
  })

  it('throws for other values', () => {
    expect(() => parseBoolQueryValue({ foo: 'foo' }, 'foo')).toThrowError(
      SearchParamError,
    )

    expect(() =>
      parseBoolQueryValue({ foo: 'bar' }, 'foo'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"invalid search param [foo]: expected true, 1, false, or 0"`,
    )
  })
})

describe('parseIntQueryValue', () => {
  it('returns 4 for 4', () => {
    expect(parseIntQueryValue({ foo: '4' }, 'foo')).toBe(4)
  })

  it('returns 40000000 for 40000000', () => {
    expect(parseIntQueryValue({ foo: '40000000' }, 'foo')).toBe(40000000)
  })

  it('returns default for missing params', () => {
    expect(parseIntQueryValue({}, 'foo', 555)).toBe(555)
  })

  it('throws for decimal values', () => {
    expect(() => parseIntQueryValue({ foo: '4.20' }, 'foo')).toThrowError(
      SearchParamError,
    )

    expect(() =>
      parseIntQueryValue({ foo: '4.20' }, 'foo'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"invalid search param [foo]: expected an integer"`,
    )
  })

  it('throws for undefined params', () => {
    expect(() =>
      parseIntQueryValue({ foo: undefined }, 'foo', 555),
    ).toThrowErrorMatchingInlineSnapshot(
      `"invalid search param [foo]: expected a single value"`,
    )
  })

  it('throws for multiple values', () => {
    expect(() =>
      parseIntQueryValue({ foo: ['4.20', '7.20'] }, 'foo'),
    ).toThrowError(SearchParamError)

    expect(() =>
      parseIntQueryValue({ foo: ['4.20', '7.20'] }, 'foo'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"invalid search param [foo]: expected a single value"`,
    )
  })
})

describe('parseEnumQueryValue', () => {
  it('returns value if it is in the options', () => {
    expect(parseEnumQueryValue({ foo: 'a' }, 'foo', ['a', 'b'])).toBe('a')
  })

  it('throws if value is not in options', () => {
    expect(() =>
      parseEnumQueryValue({ foo: 'a' }, 'foo', ['b', 'c']),
    ).toThrowErrorMatchingInlineSnapshot(
      `"invalid search param [foo]: invalid option [a], expected one of \\"b\\",\\"c\\""`,
    )
  })

  it('returns default if query param is missing', () => {
    expect(parseEnumQueryValue({}, 'foo', ['a', 'b'], 'a')).toBe('a')
  })
})
