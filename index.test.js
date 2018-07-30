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
    const $ = placeholderGenerator()
    const params = {
      name: 'aname',
      id: 'aid'
    }
    const got = where`  name =
    ${params.name}
    AND  id =  ${params.id}
    AND address = 'somewhere'
    `($.gen)
    const expected = "WHERE name = $1 AND id = $2 AND address = 'somewhere'"
    expect(got).toEqual(expected)
    expect($.getValues()).toEqual(['aname', 'aid'])
  })

  it("should remove unfilled gaps and associates", () => {
    const $ = placeholderGenerator()
    const params = {}
    const got = where`
    name = ${undefined} AND public.id = ${undefined} OR address = ${undefined} (id = ${undefined} OR address = ${undefined}) AND mobile = ${undefined}
    `($.gen)

    const expected = ''
    expect(got).toEqual(expected)
    expect($.getValues()).toEqual([])
  })
})

describe("sql", () => {
  it("works", () => {
    const params = {
      id: 1,
      name: 'apple',
      limit: 10,
      offset: 20
    }
    const result = sql`
    SELECT * FROM users
    ${where`
      id = ${params.id} AND
      name like ${params.name} AND
      location = ${params.location}`}
    ${limit`${params.limit}`}
    ${offset`${params.offset}`};
    `

    const expectedSql = `
    SELECT * FROM users
    WHERE id = $1 AND name like $2
    LIMIT $3
    OFFSET $4;
    `
    const expected = [expectedSql, [1, "apple", 10, 20]]
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
    const got = limit`${params.limit}`($.gen)
    expect(got).toEqual(expected)
    expect($.getValues()).toEqual([params.limit])
  })

  it("returns empty string if falsy value is passed", () => {
    const $ = placeholderGenerator()
    const expected = ''

    const got1 = limit`${undefined}`($.gen)
    expect(got1).toEqual('')

    const got2 = limit`${null}`($.gen)
    expect(got2).toEqual('')

    const got3 = limit`${0}`($.gen)
    expect(got3).toEqual('')

    const got4 = limit`${false}`($.gen)
    expect(got4).toEqual('')
  })
})

describe("offset", () => {
  it("works", () => {
    const $ = placeholderGenerator()
    const params = {
      offset: 50
    }
    const expected = 'OFFSET $1'
    const got = offset`${params.offset}`($.gen)
    expect(got).toEqual(expected)
    expect($.getValues()).toEqual([params.offset])
  })

  it("returns empty string if falsy value is passed", () => {
    const $ = placeholderGenerator()
    const expected = ''

    const got1 = offset`${undefined}`($.gen)
    expect(got1).toEqual('')

    const got2 = offset`${null}`($.gen)
    expect(got2).toEqual('')

    const got3 = offset`${0}`($.gen)
    expect(got3).toEqual('')

    const got4 = offset`${false}`($.gen)
    expect(got4).toEqual('')
  })
})
