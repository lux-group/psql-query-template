## psql-query-template
It empowers one to write complex and safe Postgres queries.

## Problems it solves
- static sql queries do not scale
- its hard to express complex db queries using ORM and query builders

## Walkthrough
```javascript
const {render} = require("psql-query-template")

// prepare a db client
const { Client } = require('pg')
const client = new Client()
await client.connect()

const queryTemplate = `
{select} FROM user {filter} {limit} {offset};
`

const fillers = {
  select($, values) {
    let fields = "*"
    if(values.fields) {
      fields = values.fields.split(",").map(field => $(field)).join(",")
    }
    return `SELECT ${fields}`
  },
  filter($, values) {
    const {name, location} = values
    let conds = []

    if(name) conds.push(`name=${$(name)}`)
    if(location) conds.push(`location=${$(location)}`)
    if(conds.length > 0) {
      return "WHERE " + conds.join(" AND ")
    }
  },
  limit($, values) {
    const {limit} = values
    if(limit) {
      return `LIMIT ${$(limit)}`
    }
  },
  // intensionally left unimplemented to demostrate
  // that unfilled placeholder gets removed
  offset($, values) { }
}

const values = {
  fields: "id,name,location",
  name: "aname",
  location: "alocation",
  limit: 10
}

const query = render(queryTemplate, fillers, values)

console.log(query[0])
>> "SELECT $1,$2,$3 FROM user WHERE name=$4 AND location=$5 LIMIT $6 ;"

console.log(query[1])
>> ["id", "name", "location", "aname", "alocation", 10]


// query the db
const res = await client.query(...query)

```
