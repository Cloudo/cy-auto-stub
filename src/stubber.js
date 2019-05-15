const {
  getFixtureDir,
  getFixturePath,
  url2filename,
  url2alias,
} = require('./utils')

beforeEach(function() {
  const forceAPIRecording = Cypress.env('forceAPIRecording')
  let isInRecordingModePromise

  const fixtureDir = getFixtureDir(Cypress.spec, this.currentTest)
  const fixturePath = getFixturePath(fixtureDir)

  if (forceAPIRecording) {
    isInRecordingModePromise = Cypress.Promise.resolve(true)
  } else {
    isInRecordingModePromise = cy
      .task('isFixtureExisted', `cypress/fixtures/${fixturePath}`, {
        log: false,
      })
      .then(isFixtureExisted => !isFixtureExisted)
  }

  // cy.task() does not return Promise, need to use any to bypass type check
  isInRecordingModePromise.then(isInRecordingMode => {
    cy._isInRecordingMode = isInRecordingMode

    cy.log(`API Auto Recording: ${isInRecordingMode ? 'ON' : 'OFF'}`)
    if (isInRecordingMode) {
      cy.log('Use real API response.')
    } else {
      cy.log(`Use recorded API response: ${fixtureDir}`)
    }

    cy._apiData = []
    cy._apiCount = 0
    cy.server({
      onRequest: () => {
        cy._apiCount++
      },
      onResponse: xhr => {
        /**
         * Sometimes there are some time windows between API requests, e.g. Request1 finishes,
         * but Request2 starts after 100ms, in this case, cy.waitUntilAllAPIFinished() would
         * not work correctly, so when we decrease the counter, we need to have a delay here.
         */
        const delayTime = isInRecordingMode ? 500 : 0
        if (cy._apiCount === 1) {
          setTimeout(() => {
            cy._apiCount--
          }, delayTime)
        } else {
          cy._apiCount--
        }

        if (isInRecordingMode) {
          /**
           * save URL without the host info, because API host might be different between
           * Record and Replay session
           */
          let url = ''
          let matchHostIndex = -1
          const apiHosts = Cypress.env('apiHosts').split(',')
          for (let i = 0; i < apiHosts.length; i++) {
            const host = apiHosts[i].trim()
            if (xhr.url.includes(host)) {
              url = xhr.url.replace(host, '')
              matchHostIndex = i
              break
            }
          }

          const method = xhr.method
          const request = {
            body: xhr.request.body,
          }
          const response = {
            body: xhr.response.body,
          }
          // save API request/response into an array so we can write these info to fixture
          cy._apiData.push({
            url,
            method,
            request,
            response,
            matchHostIndex,
          })
        }
      },
    })

    if (isInRecordingMode) {
      const stubAPIPatterns = Cypress.env('stubAPIPatterns').split(',')
      stubAPIPatterns.forEach(pattern => {
        const apiRegex = new RegExp(pattern.trim())
        cy.route('GET', apiRegex)
        cy.route('POST', apiRegex)
        cy.route('PUT', apiRegex)
        cy.route('DELETE', apiRegex)
      })
    } else {
      const apiHosts = Cypress.env('apiHosts').split(',')
      cy.fixture(fixturePath).then(fixture => {
        fixture.records.forEach(apiRecord => {
          const fullUrl = `${apiHosts[apiRecord.matchHostIndex].trim()}${
            apiRecord.url
          }`

          const fixtureShortcut = `fixture:${fixtureDir}/${url2filename(
            apiRecord.url
          )}`
          cy.route(apiRecord.method, fullUrl, fixtureShortcut).as(
            url2alias(apiRecord.url)
          )
        })
      })
    }
  })
})

// do not use arrow function because we need to use `this` inside
afterEach(function() {
  // only save api data to fixture when test is passed
  if (this.currentTest.state === 'passed' && cy._isInRecordingMode) {
    const fixtureDir = getFixtureDir(Cypress.spec, this.currentTest)
    const fixturePath = getFixturePath(fixtureDir)

    cy.task('isFixtureExisted', fixturePath, {
      log: false,
    }).then(isFixtureExisted => {
      if (isFixtureExisted) {
        // cy.readFile(`cypress/fixtures/${fixturePath}`, { log: false }).then(apiRecords => {
        //   apiRecords[testCaseTitle] = {
        //     timestamp: new Date().toJSON(),
        //     records: cy._apiData,
        //   }
        //   cy.writeFile(`cypress/fixtures/${fixturePath}`, apiRecords, { log: false })
        // })
      } else {
        cy.writeFile(
          `cypress/fixtures/${fixturePath}`,
          {
            timestamp: new Date().toJSON(),
            records: cy._apiData.map(record => ({
              ...record,
              response: url2filename(record.url),
            })),
          },
          { log: false }
        )

        cy._apiData.forEach(record => {
          cy.writeFile(
            `cypress/fixtures/${fixtureDir}/${url2filename(record.url)}`,
            record.response.body,
            { log: false }
          )
        })
      }
      cy.log('API recorded', cy._apiData)
    })
  }
})
