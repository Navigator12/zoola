const { Schema, model } = require('mongoose')

const JobSchema = new Schema({
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  status: { type: String, enum: ['DONE', 'PAST', 'YESTERDAY'], required: true },
})

module.exports = model('Job', JobSchema)
