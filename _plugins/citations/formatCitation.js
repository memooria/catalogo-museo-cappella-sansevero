const chalkFactory = require('~lib/chalk')
const Processor = require('simple-cite')

const logger = chalkFactory('plugins:citations')

const defaultStyles = {
  chicago: require('./styles/chicago-fullnote-bibliography'),
  mla: require('./styles/mla')
}

module.exports = function(options = {}) {
  const locale = require(options.locale || 'locale-en-us')
  const styles = Object.assign(defaultStyles, options.styles)

  return function(item, params) {
    const { type } = params

    const style = styles[type]

    if (!style) {
      logger.error(`Citation style "${type}" is not supported. You may need to add it to _plugins/citations/styles.`)
      return
    }

    const processor = new Processor({
      items: [item],
      locale,
      style
    })

    processor.cite({ citationItems: [{ id: item.id }] })
    const citation = processor.bibliography().value
    let fullCitation = citation.replace(/\s+$/, '')

    // Rimuove URL se presente
    fullCitation = fullCitation.replace(/https?:\/\/[^\s]+/, '')

    // Aggiunge DOI come link cliccabile ma senza la URL estesa
    if (item.doi) {
      fullCitation += ` DOI: <a href="https://doi.org/${item.doi}" target="_blank" rel="noopener">${item.doi}</a>`
    }

    fullCitation += ' Accessed <span class="cite-current-date">DD Mon. YYYY</span>.'

    return fullCitation
  }
}
