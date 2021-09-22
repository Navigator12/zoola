const Job = require('../models/Job')

const MetricsService = require('../services/metrics')

const { DAY, getFormatDate, todayDate } = require('../utils')

const createPastJobs = async () => {
  const actualDate = todayDate()

  if (await Job.count() === 0) {
    const jobs = []

    // Scrap last half year data
    for (let from = 183, to = from - 30, month = 1; month <= 6; month += 1, from -= 30, to -= 30) {
      const fromDate = new Date(actualDate - from * DAY)
      const toDate = new Date(actualDate - to * DAY)

      jobs.push({
        from: fromDate,
        to: toDate,
        status: 'PAST',
      })
    }

    await Job.insertMany(jobs)
  }

  const lastJob = await Job.findOne().sort('-_id')

  if (lastJob.to.getTime() < new Date(actualDate - 2 * DAY).getTime()) {
    const fromDate = new Date(lastJob.to.getTime() + DAY)
    const toDate = new Date(actualDate - 2 * DAY)

    const newJob = new Job({
      from: fromDate,
      to: toDate,
      status: 'PAST',
    })

    await newJob.save()
  }
}

const doPastJobs = async () => {
  const jobs = await Job.find({
    status: 'PAST',
  })

  for (const job of jobs) {
    await MetricsService.CreateMeetings(getFormatDate(job.from), getFormatDate(job.to))

    job.status = 'DONE'

    await job.save()
  }
}

const execute = async () => {
  await createPastJobs()
  await doPastJobs()
}

module.exports = execute
