const {parameterizeTemplate, renderQuery} = require("./index")

describe("parameterizeTemplate", () => {
  it("works", () => {
    const queryTemplate = "SELECT * FROM user WHERE name={name} LIMIT {limit};"
    const queryParams = {
      name: "lal",
      limit: 5
    }
    const expected = [
      "SELECT * FROM user WHERE name=$1 LIMIT $2;",
      [queryParams.name, queryParams.limit]
    ]

    const got = parameterizeTemplate(queryTemplate, queryParams)
    expect(got).toEqual(expected)
  })

  it("removes unfilled holes", () => {
    const queryTemplate = `
    SELECT * FROM user
    WHERE name={name--}}
    LIMIT {limit};
    `
    const queryParams = {}
    const expectedQuery = `
    SELECT * FROM user
    WHERE name=
    LIMIT ;
    `
    const expected = [
      expectedQuery,
      []
    ]

    const got = parameterizeTemplate(queryTemplate, queryParams)
    expect(got).toEqual(expected)
  })
})

function genFields(qp) {
  if(qp.fields) {
    return "{fields}"
  }
  return "*"
}

function genFilter(qp) {
  if(qp.location) {
    return "WHERE location={location}"
  }
}

function genLimit(qp) {
  if(qp.limit) {
    return "LIMIT {limit}"
  }
}

describe("renderQuery", () => {
  it("works", () => {
    const queryTemplate = `
SELECT {{fields}}
FROM user
{{filter}}
{{limit}};
    `
    const queryParams = {
      fields: "id,name,location",
      location: "sydney",
      limit: 10
    }
    const fillers = {
      fields: genFields,
      filter: genFilter,
      limit: genLimit
    }

    const expectedQuery = `
SELECT $1
FROM user
WHERE location=$2
LIMIT $3;
    `
    const expectedValues = ["id,name,location", "sydney", 10]

    const got = renderQuery(queryTemplate, fillers, queryParams)
    expect(got).toEqual([expectedQuery, expectedValues])
  })

  it("is not vulnerable to sql injection", () => {
    function genFilter(qp) {
      return `{${qp.location}}`
    }

    const queryTemplate = `
SELECT {{fields}}
FROM user
{{filter}}
{{limit}};
    `
    const queryParams = {
      // attack
      fields: "; drop table atable;",
      // attack
      location: "; drop table btable;",
      // attack
      limit: "; drop table ctable;"
    }
    const fillers = {
      fields: genFields,
      // dev mistake
      filter: genFilter,
      limit: genLimit
    }

    const expectedQuery = `
SELECT $1
FROM user

LIMIT $2;
    `
    const expectedValues = [queryParams.fields, queryParams.limit]

    const got = renderQuery(queryTemplate, fillers, queryParams)
    expect(got).toEqual([expectedQuery, expectedValues])
  })
})
