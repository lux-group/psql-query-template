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

function render(template, fillers, values) {
  const generator = placeholderGenerator()
  const $ = generator.gen

  const fills = Object.keys(fillers).reduce((acc, key) => {
    if(template.indexOf(`{${key}}`) !== -1) {
      acc[key] = fillers[key]($, values) || ""
    }
    return acc
  }, {})

  const renderedQuery = Object.keys(fills).reduce((acc, key) => {
    return acc.replace(new RegExp(`{${key}}`, "g"), fills[key])
  }, template)

  return [renderedQuery, generator.getValues()]
}

function where(tpl) {
  return ($, params) => {
    // remove redundant space
    tpl = tpl.replace(/\s\s+/g, ' ')
    tpl = tpl.trim()

    Object.keys(params).map(key => {
      // replace 'id = {id}' with 'id = $1'
      tpl = tpl.replace(new RegExp(`{${key}}`, 'g'), $(params[key]))
    })

    // // replace '^id = {id} AND ...'
    tpl = tpl.replace(/^\w+\s[a-zA-Z0-9_=<>]+\s{\w+}\s\w+\s/g, '')
    // replace '...AND id = {id}'
    tpl = tpl.replace(/\s\w+\s\w+\s[a-zA-Z0-9_=<>]+\s{\w+}/g, '')
    // // replace '^id = {id}$'
    tpl = tpl.replace(/^\w+\s[a-zA-Z0-9_=<>]+\s{\w+}$/, '')
    // // replace '(id = {id})'
    tpl = tpl.replace(/\(\w+\s[a-zA-Z0-9_=<>]+\s{\w+}\)$/g, '')
    return tpl
  }
}

module.exports = {
  render,
  placeholderGenerator,
  where
}
