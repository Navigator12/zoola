const { monthNames, fill, todayDate } = require('./date')

const { DOMAIN } = process.env

const xlsxDateFormat = (date) => `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
const xlsxTimeFormat = (date) => `${fill(date.getHours())}:${fill(date.getMinutes())}`

const xlsxLeaveReasonFormat = (str) => {
  str = str.substr(str.indexOf('Reason: ') + 8)
  str = str[0].toUpperCase() + str.substr(1)

  return str
}

const getFormatDate = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

const getDateFromQuery = (date, defaultDateType) => {
  if (!date) {
    const newDate = new Date()

    if (defaultDateType === 'min') newDate.setTime(0)
    else newDate.setTime(todayDate().getTime())

    return newDate
  }

  const [year, month, day] = date.split('-')

  return new Date(Date.UTC(year, month - 1, day))
}

const reportPath = (filename) => `${DOMAIN}/reports/${filename}.xlsx`

const xlsxBorder = (sheet, top, bottom, left, right) => {
  sheet.range(`${left}${top}:${right}${top}`)
    .style('topBorder', true)

  sheet.range(`${left}${bottom}:${right}${bottom}`)
    .style('bottomBorder', true)

  sheet.range(`${left}${top}:${left}${bottom}`)
    .style('leftBorder', true)

  sheet.range(`${right}${top}:${right}${bottom}`)
    .style('rightBorder', true)
}

module.exports = {
  xlsxDateFormat,
  xlsxTimeFormat,
  xlsxLeaveReasonFormat,
  getFormatDate,
  getDateFromQuery,
  reportPath,
  xlsxBorder,
}
