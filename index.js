function render(template, fillers, values) {
  let queryValues = []

  function $(value) {
    queryValues.push(value)
    return `$${queryValues.length}`
  }

  const fills = Object.keys(fillers).reduce((acc, key) => {
    acc[key] = fillers[key]($, values) || ""
    return acc
  }, {})

  const renderedQuery = Object.keys(fills).reduce((acc, key) => {
    return acc.replace(new RegExp(`{${key}}`, "g"), fills[key])
  }, template)

  return [renderedQuery, queryValues]
}

module.exports = {
  render
}
