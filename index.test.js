const {
  placeholderGenerator,
  where,
  sql,
  limit,
  offset
} = require("./index")

describe("placeholderGenerator.gen", () => {
  it("should return placeholder", () => {
    const $ = placeholderGenerator()
    expect($.gen('a')).toEqual('$1')
    expect($.gen('b')).toEqual('$2')
  })
})

describe("placeholderGenerator.getValues", () => {
  it("should return values", () => {
    const $ = placeholderGenerator()
    $.gen('a')
    $.gen('b')

    expect($.getValues()).toEqual(['a', 'b'])
  })
})

describe("where", () => {
  it("should fill gaps", () => {
    const tpl = '  name =  {name} AND  id =  {id}  '
    const $ = placeholderGenerator()
    const params = {
      name: 'aname',
      id: 'aid'
    }
    const got = where(tpl)($.gen, params)

    const expected = 'WHERE name = $1 AND id = $2'
    expect(got).toEqual(expected)
    expect($.getValues()).toEqual(['aname', 'aid'])
  })

  it("should remove unfilled gaps and associates", () => {
    const tpl = 'name = {name} AND public.id = {id} OR address = {address}'
    const $ = placeholderGenerator()
    const params = {}
    const got = where(tpl)($.gen, params)

    const expected = ''
    expect(got).toEqual(expected)
    expect($.getValues()).toEqual([])
  })

  it("should remove unfilled gaps and associates", () => {
    const tpl = 'name = {name} AND (id = {id} OR address = {address})'
    const $ = placeholderGenerator()
    const params = {}
    const got = where(tpl)($.gen, params)

    const expected = ''
    expect(got).toEqual(expected)
    expect($.getValues()).toEqual([])
  })
})

describe("sql", () => {
  it("works", () => {
    const params = {
      id: 1,
      name: 'apple'
    }
    const result = sql(params)`select * from users ${where('id = {id} and name like {name} and location = {location}')};`

    const expected = ["select * from users WHERE id = $1 and name like $2;", [1, "apple"]]
    expect(result).toEqual(expected)
  })
})

describe("limit", () => {
  it("works", () => {
    const $ = placeholderGenerator()
    const params = {
      limit: 10
    }
    const expected = 'LIMIT $1'
    const got =limit()($.gen, params)
    expect(got).toEqual(expected)
    expect($.getValues()).toEqual([params.limit])
  })
})

describe("offset", () => {
  it("works", () => {
    const $ = placeholderGenerator()
    const params = {
      a: 50
    }
    const expected = 'OFFSET $1'
    const got = offset('a')($.gen, params)
    expect(got).toEqual(expected)
    expect($.getValues()).toEqual([params.a])
  })

  it("takes key", () => {
    const $ = placeholderGenerator()
    const params = {
      a: 50
    }
    const expected = 'OFFSET $1'
    const got = offset('a')($.gen, params)
    expect(got).toEqual(expected)
    expect($.getValues()).toEqual([params.a])
  })
})
