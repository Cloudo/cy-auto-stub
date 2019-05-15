const { getConfig } = require('./config')
const d = require('./defaults')

const getUtil = (defaultFn, getConfigFn) => (...args) => {
  const config = getConfig()
  const fn = getConfigFn(config)

  if (!defaultFn) {
    throw new Error(`util not found`)
  }
  return fn && typeof fn === 'function' ? fn(...args) : defaultFn(...args)
}

const getFixtureDir = getUtil(d.getFixtureDir, c => c.getFixtureDir)
const getFixturePath = getUtil(d.getFixturePath, c => c.getFixturePath)
const url2filename = getUtil(d.url2filename, c => c.url2filename)
const url2alias = getUtil(d.url2alias, c => c.url2alias)

module.exports = { getFixtureDir, getFixturePath, url2filename, url2alias }
