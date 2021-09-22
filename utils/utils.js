const axios = require('axios')

const { ZOOM_API_TOKEN, DOMAIN } = process.env

const paginate = async (baseUrl, key, time) => {
  const { data } = await axios.get(baseUrl, {
    headers: {
      Authorization: `Bearer ${ZOOM_API_TOKEN}`,
    },
  })

  const array = data[key]

  const getNextData = (token, resolve) => {
    if (token) {
      setTimeout(async () => {
        const { data: nextData } = await axios.get(`${baseUrl}&next_page_token=${token}`, {
          headers: {
            Authorization: `Bearer ${ZOOM_API_TOKEN}`,
          },
        })

        array.push(...nextData[key])

        getNextData(nextData.next_page_token, resolve)
      }, time)
    } else resolve(array)
  }

  return new Promise((resolve) => getNextData(data.next_page_token, resolve))
}

const delay = async (time) => {
  await new Promise((resolve) => {
    setTimeout(() => resolve(), time)
  })
}

const doubleEncode = (str) => encodeURIComponent(encodeURIComponent(str))

const DAY = 86400000

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const fill = (num) => (num < 10 ? `0${num}` : `${num}`)
const xlsxDateFormat = (date) => `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
const xlsxTimeFormat = (date) => `${fill(date.getHours())}:${fill(date.getMinutes())}`

const xlsxLeaveReasonFormat = (str) => {
  str = str.substr(str.indexOf('Reason: ') + 8)
  str = str[0].toUpperCase() + str.substr(1)

  return str
}

const todayDate = () => {
  const date = new Date()

  date.setHours(-date.getTimezoneOffset() / 60, 0, 0, 0)

  return date
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

module.exports = {
  paginate,
  delay,
  doubleEncode,
  DAY,
  todayDate,
  getFormatDate,
  getDateFromQuery,
  xlsxDateFormat,
  xlsxTimeFormat,
  xlsxLeaveReasonFormat,
  reportPath,
}
