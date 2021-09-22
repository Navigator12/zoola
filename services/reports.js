const XlsxPopulate = require('xlsx-populate')

const Meeting = require('../models/Meeting')
const Participant = require('../models/Participant')
const Report = require('../models/Report')

const {
  xlsxDateFormat,
  xlsxTimeFormat,
  xlsxLeaveReasonFormat,
  reportPath,
} = require('../utils/utils')

const { PASSWORD } = process.env

class ReportsService {
  static async PerMemberReport(username, from, to, filename) {
    const data = await this.PerMemberData(username, from, to)

    const report = await Report.findOne({ filename })

    if (report) return reportPath(report.filename)

    const headers = [
      ['User name', 20, 'center'],
      ['User id', 12, 'left'],
      ['Meeting id', 14, 'left'],
      ['Topic', 50, 'center'],
      ['Meeting duration', 17, 'left'],
      ['Date', 20, 'center'],
      ['Join time', 11, 'center'],
      ['Leave time', 11, 'center'],
      ['Reason to leave', 26, 'center'],
      ['Participation time', 17, 'left'],
      ['Total participation', 17, 'left'],
      ['Participation', 13, 'left'],
    ]

    const parsed = data.map((d) => ({
      user_name: d.user_name,
      user_id: d.user_id,
      meeting_id: d.meeting.id,
      topic: d.meeting.topic,
      meeting_duration: d.meeting_duration,
      date: xlsxDateFormat(d.meeting.start_time),
      join_time: xlsxTimeFormat(d.time.join_time),
      leave_time: xlsxTimeFormat(d.time.leave_time),
      reason_to_live: xlsxLeaveReasonFormat(d.time.leave_reason),
      participation_time: d.time.amount,
      total_participation: d.total_time,
      participation: d.participation.toFixed(2),
    }))

    await XlsxPopulate.fromBlankAsync()
      .then(async (workbook) => {
        const sheet = workbook.sheet(0)

        for (let i = 0; i <= 11; i += 1) {
          const ch = String.fromCharCode(65 + i)

          sheet.column(ch)
            .width(headers[i][1])
            .style('horizontalAlignment', headers[i][2])

          sheet.cell(`${ch}1`)
            .style('horizontalAlignment', 'center')
        }

        sheet.range('A1:L1').value([headers.map((h) => h[0])])

        parsed.forEach((item, index) => {
          const range = sheet.range(`A${index + 2}:L${index + 2}`)
          range.value([Object.values(item)])
        })

        return workbook.toFileAsync(`./reports/${filename}.xlsx`, { password: PASSWORD })
      })
      .then(async () => {
        const newReport = new Report({
          from,
          to,
          filename,
        })

        await newReport.save()
      })

    return reportPath(filename)
  }

  static async PerMemberData(username, from, to) {
    const data = await Participant.aggregate([
      {
        $match: {
          user_name: username,
          join_time: { $gte: from },
          leave_time: { $lt: to },
        },
      },

      {
        $group: {
          _id: '$meeting_id',
          user_name: { $first: '$user_name' },
          user_id: { $first: '$user_id' },
          time: {
            $push: {
              join_time: '$join_time',
              leave_time: '$leave_time',
              amount: { $ceil: { $divide: [{ $subtract: ['$leave_time', '$join_time'] }, 1000 * 60] } },
              leave_reason: '$leave_reason',
            },
          },
        },
      },

      {
        $lookup: {
          from: 'meetings',
          localField: '_id',
          foreignField: '_id',
          as: 'meeting',
        },
      },

      { $unwind: '$meeting' },

      {
        $addFields: {
          total_time: { $sum: '$time.amount' },
          meeting_duration: { $ceil: { $divide: [{ $subtract: ['$meeting.end_time', '$meeting.start_time'] }, 1000 * 60] } },
        },
      },

      {
        $addFields: {
          participation: { $multiply: [{ $divide: ['$total_time', '$meeting_duration'] }, 100] },
        },
      },

      { $unwind: '$time' },

      { $sort: { 'time.join_time': 1 } },
    ])

    return data
  }

  static async PerMeetingReport(uuid) {
    const data = Meeting.aggregate([
      { $match: { uuid } },

      {
        $lookup: {
          from: 'participants',
          localField: 'participant_ids',
          foreignField: '_id',
          as: 'participants',
        },
      },

      { $unwind: '$participants' },

      {
        $group: {
          _id: {
            meeting: {
              uuid: '$uuid',
              id: '$id',
              topic: '$topic',
              host: '$host',
              start_time: '$start_time',
              end_time: '$end_time',
            },
            user_name: '$participants.user_name',
          },
          time: {
            $push: {
              join_time: '$participants.join_time',
              leave_time: '$participants.leave_time',
              amount: { $ceil: { $divide: [{ $subtract: ['$participants.leave_time', '$participants.join_time'] }, 1000 * 60] } },
              leave_reason: '$participants.leave_reason',
            },
          },
        },
      },

      {
        $addFields: {
          total_time: { $sum: '$time.amount' },
          meet_duration: { $ceil: { $divide: [{ $subtract: ['$_id.meeting.end_time', '$_id.meeting.start_time'] }, 1000 * 60] } },
        },
      },

      {
        $addFields: {
          participation: { $multiply: [{ $divide: ['$total_time', '$meet_duration'] }, 100] },
        },
      },

      {
        $group: {
          _id: { $mergeObjects: ['$_id.meeting', { meet_duration: '$meet_duration' }] },
          user: {
            $push: {
              user_name: '$_id.user_name',
              time: '$time',
              total_time: '$total_time',
              participation: '$participation',
            },
          },
        },
      },
    ])

    return data
  }
}

module.exports = ReportsService
