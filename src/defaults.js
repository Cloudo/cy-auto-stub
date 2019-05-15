const getFixtureDir = (spec, currentTest) => {
  const describeTitle = currentTest.parent.title
  if (describeTitle && describeTitle[0] === '@') {
    return describeTitle.replace('@', '').replace(/[^a-z0-9/-]/gi, '_')
  }

  const specName = spec.name.replace('/index.js', '')
  const isRootSpec = specName.length !== spec.name.length
  const fileName = currentTest.parent.title.replace('/', '_')

  return `${specName}/${fileName}${isRootSpec ? '.js' : ''}`
}

const getFixturePath = fixturePath => `${fixturePath}/index.json`

const url2filename = url =>
  url
    .replace('?', '___')
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase() + '.json'

const url2alias = url => url2filename(url).replace('.json', '')

module.exports = {
  getFixtureDir,
  getFixturePath,
  url2filename,
  url2alias,
}
