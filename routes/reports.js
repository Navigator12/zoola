const { Router } = require('express')

const ReportsController = require('../controllers/reports')

const router = Router()

router.get('/per_member/:username', ReportsController.PerMemberReport)
router.get('/per_meeting/:uuid(*)', ReportsController.PerMeetingReport)

module.exports = router
