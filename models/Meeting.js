const { Schema, model, Types } = require('mongoose')

const MeetingSchema = new Schema({
  uuid: { type: String },
  id: { type: Number },
  topic: { type: String },
  host: { type: String },
  email: { type: String },
  user_type: { type: String },
  start_time: { type: Date },
  end_time: { type: Date },
  duration: { type: String },
  participants: { type: Number },
  has_pstn: { type: Boolean },
  has_archiving: { type: Boolean },
  has_voip: { type: Boolean },
  has_3rd_party_audio: { type: Boolean },
  has_video: { type: Boolean },
  has_screen_share: { type: Boolean },
  has_recording: { type: Boolean },
  has_sip: { type: Boolean },

  participant_ids: [{ type: Types.ObjectId }],
})

module.exports = model('Meeting', MeetingSchema)
