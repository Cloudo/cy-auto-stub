# cy-auto-stub

Record and replay network requests for Cypress

This repo is based on [cypress-auto-stub-example](https://github.com/PinkyJie/cypress-auto-stub-example) with a few differences:

- you can specify folder and subfolder for fixture directory in `describe` block name, for example `describe('@userform/main', ...)` means that requests will be saved under fixture/userform/main directory. Why? Because I found it easier to keep pathes for fixture/snapshots/screenshots independent of test file path. Moreover, it allows you to create single file with all your tests imported for getting better performance. Check [this issue](https://github.com/cypress-io/cypress/issues/2304) for more details
- specified directory will be created with file `index.json` and `<request>.json`. You can specify `url2filename` function to deal with that. Why each request is in separate file? [80kb max for payload](https://github.com/cypress-io/cypress/issues/76), but file fixtures solve this problem
- each recorded request has associated fixture name. Check out `url2alias` function. It allows tou to `wait('@fixture_name')` for requests.

# install

```
yarn add -D Cloudo/cy-auto-stub
```

in cypress/support/index.js

```js
import autoStub from 'cy-auto-stub'

// checkout src/defaults.js for default implementation
const options = {
  // getFixtureDir,
  // getFixturePath,
  // url2filename,
  // url2alias
}

autoStub.init(options)
```

# todo

- shared mocks (automatically looking up parent directory)
- modifying responses
- typescript support
- compilation to es5
- examples
- tests
