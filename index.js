function placeholderGenerator() {
  let queryValues = []

  return {
    gen(value) {
      queryValues.push(value)
      return `$${queryValues.length}`
    },
    getValues() {
      return queryValues
    }
  }
}

// for tagged template see
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
function sql(strings) {
  const $ = placeholderGenerator()

  let fillers = Array.from(arguments)
  fillers.shift()
  let result = [strings[0]]
  fillers.forEach((filler, index) => {
    result.push(filler($.gen), strings[index + 1])
  })

  return [result.join(''), $.getValues()]
}

function cleanWhiteSpace(tpl) {
  tpl = tpl.replace(/\s\s+/g, ' ')
  return tpl.trim()
}

function where(strings) {
  let fillers = Array.from(arguments)

  return function ($) {
    fillers.shift()
    let result = [strings[0]]
    fillers.forEach((filler, index) => {
      let toPush
      if(filler === undefined) {
        // we will remove this later
        toPush = '{}'
      }
      else {
        toPush = $(filler)
      }
      result.push(toPush, strings[index + 1])
    })

    // join the pieces
    let tpl = result.join('')

    // remove unfilled conditions
    // // replace '^id = {} AND ...'
    tpl = cleanWhiteSpace(tpl)
    tpl = tpl.replace(/^[a-zA-Z_.]+\s[a-zA-Z0-9_=<>]+\s{}\s\w+\s/g, '')
    tpl = cleanWhiteSpace(tpl)
    // replace '...AND id = {id}'
    tpl = tpl.replace(/\s\w+\s[a-zA-Z_.]+\s[a-zA-Z0-9_=<>]+\s{}/g, '')
    tpl = cleanWhiteSpace(tpl)
    // // replace '(id = {id})'
    tpl = tpl.replace(/\(\s?[a-zA-Z_.]+\s[a-zA-Z0-9_=<>]+\s{}\s?\)/g, '')
    // // replace '^id = {id}$'
    tpl = cleanWhiteSpace(tpl)
    tpl = tpl.replace(/^[a-zA-Z_.]+\s[a-zA-Z0-9_=<>]+\s{}$/, '')

    tpl = cleanWhiteSpace(tpl)
    if (tpl) {
      return `WHERE ${tpl}`
    }

    return tpl
  }
}

function limit(value) {
  const args = Array.from(arguments)

  return function ($) {
    if(args.length === 2 && args[1]) {
      return `LIMIT ${$(args[1])}`
    }
    return ''
  }
}


function offset(value) {
  const args = Array.from(arguments)

  return function ($) {
    if(args.length === 2 && args[1]) {
      return `OFFSET ${$(args[1])}`
    }
    return ''
  }
}

module.exports = {
  placeholderGenerator,
  sql,
  where,
  limit,
  offset
}
