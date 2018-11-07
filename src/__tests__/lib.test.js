import { isStateObject } from '../lib'

describe('isObject', () => {
  test('anon functions', () => {
    expect(isStateObject(() => undefined)).toBe(false)
  })

  test('functions', () => {
    function foo() {}
    expect(isStateObject(foo)).toBe(false)
  })

  // We won't fix this as you shouldn't be adding regexes to your state
  test('regex', () => {
    expect(isStateObject(/foo/)).toBe(true)
  })

  test('null', () => {
    expect(isStateObject(null)).toBe(false)
  })

  test('string', () => {
    expect(isStateObject('foo')).toBe(false)
  })

  test('number', () => {
    expect(isStateObject(1)).toBe(false)
  })

  test('boolean', () => {
    expect(isStateObject(true)).toBe(false)
  })

  test('object', () => {
    expect(isStateObject({})).toBe(true)
  })

  test('class', () => {
    class Foo {}
    expect(isStateObject(Foo)).toBe(false)
  })

  test('class instance', () => {
    class Foo {}
    const foo = new Foo()
    expect(isStateObject(foo)).toBe(true)
  })

  test('array', () => {
    expect(isStateObject([])).toBe(false)
  })
})
