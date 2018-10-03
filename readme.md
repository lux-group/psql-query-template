## psql-query-template
It empowers one to write complex and safe Postgres queries.

## Problems it solves
- static sql queries do not scale
- its hard to express complex db queries using ORM and query builders

## Installation
`yarn add psql-query-template`

or

`npm install --save psql-query-template`

## Walkthrough
```javascript
const {sql, where, and, or, limit} = require("psql-query-template")

// prepare a db client
const { Client } = require('pg')
const client = new Client()
await client.connect()

const queryParams = {
  search: "lal",
  location: "sydney",
  page: 2,
  limit: 50
}

// psql-query-template makes use of tagged template
// visit https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates
// prepare query template
const query = sql`
SELECT * FROM user

${where(
  or(
    ["name ilike", queryParams.search],
    and(
      ["location =", queryParams.location],
      ["password =", undefined],
      "active = TRUE"
    )
  )
)}

${limit(queryParams.limit)}

${genPlaceholder => {
  // this is a custom filler for offset
  // this is how where and limit works internally
  const { page, limit } = queryParams
  if(page) {
    const offset = (page - 1) * limit
    return `OFFSET ${genPlaceholder(offset)}`
  }
  return ''
}}
;
`

console.log(query[0])
```
>> "
SELECT * FROM user

WHERE ( name ilike $1 OR ( location = $2 AND active = TRUE ) )

LIMIT $3

OFFSET $4
;
"
```

console.log(query[1])
`>> ["lal", "sydney", 50, 50]`


// query the db
const res = await client.query(...query)

```
