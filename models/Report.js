const { Schema, model } = require('mongoose')

const reportSchema = new Schema({
  filename: { type: String, required: true },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
})

module.exports = model('Report', reportSchema)
