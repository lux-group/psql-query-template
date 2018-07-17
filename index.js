function newPlaceholderGenerator() {
  let queryValues = []

  return {
    genPlaceholder(value) {
      queryValues.push(value)
      return `$${queryValues.length}`
    },
    getValues() {
      return queryValues
    }
  }
}

function render(template, fillers, values) {
  const placeholderGenerator = newPlaceholderGenerator()
  const $ = placeholderGenerator.genPlaceholder

  const fills = Object.keys(fillers).reduce((acc, key) => {
    if(template.indexOf(`{${key}}`) !== -1) {
      acc[key] = fillers[key]($, values) || ""
    }
    return acc
  }, {})

  const renderedQuery = Object.keys(fills).reduce((acc, key) => {
    return acc.replace(new RegExp(`{${key}}`, "g"), fills[key])
  }, template)

  return [renderedQuery, placeholderGenerator.getValues()]
}

module.exports = {
  render,
  newPlaceholderGenerator
}
