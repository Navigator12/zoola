const ReportsService = require('../services/reports')

class ReportsController {
  static async PerMemberReport(req, res) {
    try {
      const { username } = req.params

      const data = await ReportsService.PerMemberReport(username)

      return res.status(200).json({ data })
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
      console.log(e)

      return res.status(400).json({ error: e })
    }
  }
}

module.exports = ReportsController
