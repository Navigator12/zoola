const XlsxPopulate = require('xlsx-populate')

const Meeting = require('../models/Meeting')
const Participant = require('../models/Participant')
const Report = require('../models/Report')

const {
  xlsxDateFormat,
  xlsxTimeFormat,
  xlsxLeaveReasonFormat,
  xlsxBorder,
  reportPath,
  Generator,
  arrayMultiply,
} = require('../utils')

const { PASSWORD } = process.env

class ReportsService {
  static async PerMemberReport(username, from, to, filename) {
    const report = await Report.findOne({ filename })

    if (report) return reportPath(report.filename)

    const data = await this.PerMemberData(username, from, to)

    const headers = [
      ['User name', 20, 'center'],
      ['User ID', 12, 'left'],
      ['Meeting ID', 14, 'left'],
      ['Topic', 50, 'center'],
      ['Meeting duration', 17, 'left'],
      ['Date', 20, 'center'],
      ['Join time', 11, 'center'],
      ['Leave time', 11, 'center'],
      ['Reason to leave', 26, 'center'],
      ['Participation time', 17, 'right'],
      ['Total participation', 17, 'right'],
      ['Participation', 13, 'right'],
    ]

    const parsed = data.map((d) => ({
      user_name: d.user_name,
      user_id: d.time.user_id,
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

        for (let i = 0; i < headers.length; i += 1) {
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

  static async PerMeetingReport(id, from, to, filename) {
    const report = await Report.findOne({ filename })

    if (report) return reportPath(report.filename)

    const data = await this.PerMeetingData(id, from, to)

    const headers = {
      head: [
        [
          'Meeting ID',
          'Meeting UUID',
          'Topic',
          'Date',
        ],
        [
          'Start time',
          'End time',
          'Meeting duration',
          'Host',
        ],
      ],
      body: [
        ['User name', 20, 'center'],
        ['User ID', 13, 'left'],
        ['Join time', 28, 'center'],
        ['Leave time', 28, 'center'],
        ['Reason to leave', 27, 'center'],
        ['Participation time', 38, 'right'],
        ['Total participation', 18, 'right'],
        ['Participation', 18, 'right'],
      ],
    }

    const head = (values) => {
      const result = []

      headers.head.forEach((line, index) => {
        result.push([])

        line.forEach((item, i) => {
          result[index].push(item, values[i + line.length * index])
        })
      })

      return result
    }

    const parsed = data.map((d) => ({
      meeting_id: d._id.id,
      meeting_uuid: d._id.uuid,
      topic: d._id.topic,
      date: xlsxDateFormat(d._id.start_time),
      start_time: xlsxTimeFormat(d._id.start_time),
      end_time: xlsxTimeFormat(d._id.end_time),
      meeting_duration: d._id.meeting_duration,
      host: d._id.host,
      users: d.users.map((u) => ({
        user_name: u.user_name,
        used_id: u.time.user_id,
        join_time: xlsxTimeFormat(u.time.join_time),
        leave_time: xlsxTimeFormat(u.time.leave_time),
        reason_to_live: xlsxLeaveReasonFormat(u.time.leave_reason),
        participation_time: u.time.amount,
        total_participation: u.total_time,
        participation: u.participation.toFixed(2),
      })),
    }))

    await XlsxPopulate.fromBlankAsync()
      .then((workbook) => {
        const sheet = workbook.sheet(0)

        for (let i = 0; i < headers.body.length; i += 1) {
          const ch = String.fromCharCode(65 + i)

          sheet.column(ch)
            .width(headers.body[i][1])
            .style('horizontalAlignment', headers.body[i][2])
        }

        const gen = new Generator()

        parsed.forEach((item) => {
          const header = head(Object.values(item))

          let start = gen.get() + 1
          header.forEach((h) => {
            const range = sheet.range(`A${gen.getNext()}:H${gen.get()}`)
            range.value([h])

            range
              .style('horizontalAlignment', [arrayMultiply(['left', 'center'], 4)])
              .style('fill', [arrayMultiply([null, 'ffcc99'], 4)])

            gen.skip()
          })
          let end = gen.get() - 1

          xlsxBorder(sheet, start, end, 'A', 'H')

          const keys = sheet.range(`A${gen.getNext()}:H${gen.get()}`)
          keys.value([headers.body.map((h) => h[0])])
          keys.style('horizontalAlignment', 'center')

          start = gen.get()
          item.users.forEach((user) => {
            const values = sheet.range(`A${gen.getNext()}:H${gen.get()}`)
            values.value([Object.values(user)])
          })
          end = gen.get()

          xlsxBorder(sheet, start, end, 'A', 'H')

          gen.skip(3)
        })

        return workbook.toFileAsync(`./reports/${filename}.xlsx`, { password: PASSWORD })
      }).then(async () => {
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
          time: {
            $push: {
              user_id: '$user_id',
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

  static async PerMeetingData(id, from, to) {
    const data = await Meeting.aggregate([
      {
        $match: {
          id: Number.parseInt(id, 10),
          start_time: { $gte: from },
          end_time: { $lt: to },
        },
      },

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
              user_id: '$participants.user_id',
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
          meeting_duration: { $ceil: { $divide: [{ $subtract: ['$_id.meeting.end_time', '$_id.meeting.start_time'] }, 1000 * 60] } },
        },
      },

      {
        $addFields: {
          participation: { $multiply: [{ $divide: ['$total_time', '$meeting_duration'] }, 100] },
        },
      },

      { $unwind: '$time' },

      {
        $group: {
          _id: { $mergeObjects: ['$_id.meeting', { meeting_duration: '$meeting_duration' }] },
          users: {
            $push: {
              user_name: '$_id.user_name',
              time: '$time',
              total_time: '$total_time',
              participation: '$participation',
            },
          },
        },
      },

      { $sort: { '_id.start_time': 1 } },
    ])

    return data
  }
}

module.exports = ReportsService
