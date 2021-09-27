const ReportsService = require('../services/reports')

const { getDateFromQuery, getFormatDate } = require('../utils')

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
      if (e.statusCode === 404) {
        return res.status(e.statusCode).json({ error: e.message })
      }

      return res.status(400).json({ error: e.message })
    }
  }

  static async PerMeetingReport(req, res) {
    try {
      const { id } = req.params

      const from = getDateFromQuery(req.query.from, 'min')
      const to = getDateFromQuery(req.query.to, 'max')

      const filename = `Meeting ${id}_${getFormatDate(from)}_${getFormatDate(to)}`

      const link = await ReportsService.PerMeetingReport(Number.parseInt(id), from, to, filename)

      return res.status(200).json({ link })
    } catch (e) {
      if (e.statusCode === 404) {
        return res.status(e.statusCode).json({ error: e.message })
      }

      return res.status(400).json({ error: e.message })
    }
  }
}

module.exports = ReportsController
