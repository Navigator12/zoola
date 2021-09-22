const ReportsService = require('../services/reports')

const { getDateFromQuery, getFormatDate } = require('../utils/utils')

class ReportsController {
  static async PerMemberReport(req, res) {
    try {
      const { username } = req.params

      const from = getDateFromQuery(req.query.from, 'min')
      const to = getDateFromQuery(req.query.to, 'max')

      const filename = `${username}_${getFormatDate(from)}_${getFormatDate(to)}`

      const link = await ReportsService.PerMemberReport(username, from, to, filename)

      return res.status(200).json({ link })
    } catch (e) {
      return res.status(400).json({ error: e })
    }
  }

  static async PerMeetingReport(req, res) {
    try {
      const { uuid } = req.params

      const data = await ReportsService.PerMeetingReport(uuid)

      return res.status(200).json({ data })
    } catch (e) {
      return res.status(400).json({ error: e })
    }
  }
}

module.exports = ReportsController
