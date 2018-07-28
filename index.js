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
function sql(params) {
  const $ = placeholderGenerator()
  return function (strings) {
    let fillers = Array.from(arguments)
    fillers.shift()
    let result = [strings[0]]
    fillers.forEach((filler, index) => {
      result.push(filler($.gen, params), strings[index + 1])
    })

    return [result.join(''), $.getValues()]
  }
}

function where(tpl) {
  return ($, params) => {
    // remove redundant white space
    tpl = tpl.replace(/\s\s+/g, ' ')
    tpl = tpl.trim()

    Object.keys(params).forEach(key => {
      if(new RegExp(`{${key}}`).test(tpl)) {
        // replace 'id = {id}' with 'id = $1'
        tpl = tpl.replace(new RegExp(`{${key}}`, 'g'), $(params[key]))
      }
    })

    // // replace '^id = {id} AND ...'
    tpl = tpl.replace(/^[a-zA-Z_.]+\s[a-zA-Z0-9_=<>]+\s{\w+}\s\w+\s/g, '')
    // replace '...AND id = {id}'
    tpl = tpl.replace(/\s\w+\s[a-zA-Z_.]+\s[a-zA-Z0-9_=<>]+\s{\w+}/g, '')
    // // replace '^id = {id}$'
    tpl = tpl.replace(/^[a-zA-Z_.]+\s[a-zA-Z0-9_=<>]+\s{\w+}$/, '')
    // // replace '(id = {id})'
    tpl = tpl.replace(/\(\s?[a-zA-Z_.]+\s[a-zA-Z0-9_=<>]+\s{\w+}\s?\)/g, '')

    if (tpl) {
      return `WHERE ${tpl}`
    }

    return tpl
  }
}

function limit(key) {
  return ($, params) => {
    const val = params[key || 'limit']
    if(val) {
      return `LIMIT ${$(val)}`
    }
  }
}


function offset(key) {
  return ($, params) => {
    const val = params[key || 'offset']
    if(val) {
      return `OFFSET ${$(val)}`
    }
  }
}

module.exports = {
  placeholderGenerator,
  sql,
  where,
  limit,
  offset
}
