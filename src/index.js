require('./stubber')
require('./commands')
const { setConfig } = require('./config')

module.exports = {
  init: config => setConfig(config),
}
