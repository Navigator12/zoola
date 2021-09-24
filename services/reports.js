const XlsxPopulate = require('xlsx-populate')

const Report = require('../models/Report')

const ReportQueries = require('../queries/reports')

const { perMemberQueryMapper, perMeetingQueryMapper } = require('../mappers/reportQueriesToXlsx')

const {
  xlsxBorder, reportPath, Generator, arrayMultiply,
} = require('../utils')

const { PASSWORD } = process.env

class ReportsService {
  static async PerMemberReport(username, from, to, filename) {
    const report = await Report.findOne({ filename })

    if (report) return reportPath(report.filename)

    const data = await ReportQueries.PerMemberData(username, from, to)

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

    const parsed = perMemberQueryMapper(data)

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

    const data = await ReportQueries.PerMeetingData(id, from, to)

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

    const parsed = perMeetingQueryMapper(data)

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
}

module.exports = ReportsService
