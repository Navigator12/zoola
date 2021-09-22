const DAY = 86400000

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const fill = (num) => (num < 10 ? `0${num}` : `${num}`)

const todayDate = () => {
  const date = new Date()

  date.setHours(-date.getTimezoneOffset() / 60, 0, 0, 0)

  return date
}

module.exports = {
  DAY,
  monthNames,
  fill,
  todayDate,
}
