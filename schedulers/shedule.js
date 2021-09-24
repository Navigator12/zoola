const schedule = require('node-schedule')

const pastJobs = require('./fetchPast')
const todayJobs = require('./fetchEveryDay')
const clearReportsJob = require('./clearReports')

const startJobs = async () => {
  console.log('START PAST JOBS')
  await pastJobs()

  console.log('START TODAY JOB')
  await todayJobs()

  console.log('END JOBS')

  schedule.scheduleJob('0 1 * * *', todayJobs)
  schedule.scheduleJob('0 1 * * *', clearReportsJob)
}

module.exports = startJobs
