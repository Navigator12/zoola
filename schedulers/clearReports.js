const fs = require('fs')

const Report = require('../models/Report')

const { todayDate, DAY } = require('../utils')

const getFilenames = async () => {
  const date = todayDate()

  const filenames = await Report.find({ date: { $lte: new Date(date - 7 * DAY) } }, { filename: 1 })

  return filenames
}

const removeFiles = async (filenames) => {
  for (const file of filenames) {
    fs.unlinkSync(`${__dirname}/../reports/${file.filename}.xlsx`)

    await Report.findByIdAndRemove(file._id)
  }
}

const execute = async () => {
  await removeFiles(await getFilenames())
}

module.exports = execute
