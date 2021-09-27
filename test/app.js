const request = require('supertest')
const App = require('../app')

const { MONGO_TEST } = process.env

const app = App(MONGO_TEST)

module.exports = {
  app,
  request,
}
