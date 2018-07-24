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

module.exports = {
  render,
  placeholderGenerator
}
