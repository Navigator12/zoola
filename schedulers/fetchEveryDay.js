const Job = require('../models/Job')

const MetricsService = require('../services/metrics')

const { DAY, getFormatDate, todayDate } = require('../utils/utils')

const createTodayJob = async () => {
  const yesterdayDate = new Date(todayDate().getTime() - DAY)

  const job = await Job.findOne({
    from: { $lte: yesterdayDate },
    to: { $gte: yesterdayDate },
  })

  if (job?.status === 'DONE') return false
  if (job?.status === 'YESTERDAY') return true

  const newJob = new Job({
    from: yesterdayDate,
    to: yesterdayDate,
    status: 'YESTERDAY',
  })

  await newJob.save()

  return true
}

const doTodayJob = async () => {
  const yesterdayDate = new Date(todayDate().getTime() - DAY)

  const job = await Job.findOne({
    from: { $lte: yesterdayDate },
    to: { $gte: yesterdayDate },
    status: 'YESTERDAY',
  })

  await MetricsService.CreateMeetings(getFormatDate(job.from), getFormatDate(job.to))

  job.status = 'DONE'

  await job.save()
}

const execute = async () => {
  if (await createTodayJob()) {
    await doTodayJob()
  }
}

module.exports = execute
