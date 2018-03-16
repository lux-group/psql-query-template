const nunjucks = require("nunjucks")

function removeUnFilledHoles(template) {
  return template.replace(/{.*}/g, "")
}

function parameterizeTemplate(intermediateQuery, queryParams) {
  let count = 0
  const toReturn = Object.keys(queryParams)
    .reduce((acc, key, index) => {
      let template = acc[0]
      let values = acc[1]
      if(template.indexOf(`{${key}}`) !== -1) {
        count = count + 1
        template = template.replace(new RegExp(`{${key}}`, "g"), `$${count}`)
        values.push(queryParams[key])
      }
      return [template, values]
    }, [intermediateQuery, []])
    return [removeUnFilledHoles(toReturn[0]), toReturn[1]]
}

function renderQuery(queryTemplate, fillers, queryParams) {
  nunjucks.configure({autoescape: false})

  // remove undefined params
  queryParams = Object.keys(queryParams)
    .filter(key => queryParams[key] !== undefined)
    .reduce((acc, key) => {
      acc[key] = queryParams[key]
      return acc
    }, {})

  // get fillers from generators
  const processedFillers = Object.keys(fillers)
    .reduce((acc, key) => {
      const filler = fillers[key](queryParams)
      if (filler) {
        acc[key] = filler
      }
      return acc
    }, {})

  const intermediateQuery = nunjucks.renderString(queryTemplate, processedFillers)
  return parameterizeTemplate(intermediateQuery, queryParams)
}


module.exports = {
  renderQuery,
  parameterizeTemplate
}
