let _config = {}

module.exports = {
  setConfig: config => {
    _config = config
  },
  getConfig: () => _config,
}
