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

function q($, unit) {
  if(typeof unit === 'string') {
    return unit
  }
  else if(Array.isArray(unit)) {
    const value = unit[1]
    if(value) {
      return [unit[0], $(value)].join(' ')
    }
    return undefined
  }
  else if (typeof unit === 'function') {
    return unit($)
  }
}

function and() {
  const args = Array.from(arguments)
  return ($) => {
    const query = args
      .map(item => {
        return q($, item)
      })
      .filter(item => !!item)
      .join(' AND ')

    if(query) {
      return `( ${query} )`
    }
  }
}

function or() {
  const args = Array.from(arguments)
  return ($) => {
    const query = args
      .map(item => {
        return q($, item)
      })
      .filter(item => !!item)
      .join(' OR ')

    if(query) {
      return `( ${query} )`
    }
  }
}

function where(orAnd) {
  return ($) => {
    const partialQuery = orAnd($)
    if (partialQuery) {
      return 'WHERE ' + partialQuery
    }
    return ''
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
  offset,
  and,
  or
}
