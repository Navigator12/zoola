const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()

const startJobs = require('./schedulers/shedule')

const { PORT, MONGO } = process.env

const startDB = async () => {
  try {
    await mongoose.connect(MONGO, {
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

startDB().then()

app.listen(PORT, () => console.log(`App has been started on port ${PORT}`))

startJobs().then()
