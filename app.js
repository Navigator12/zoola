const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()

const startDB = async (mongoURI) => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  } catch (e) {
    console.error(`DATABASE ERROR\n${e}`)
    process.exit(1)
  }
}

const app = express()

app.use(express.urlencoded({
  extended: true,
}))

app.use('/reports', express.static(`${__dirname}/reports`))

app.use('/api/reports', require('./routes/reports'))

const App = (mongoURI) => {
  startDB(mongoURI).then()

  return app
}

module.exports = App
