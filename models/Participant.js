const { Schema, model, Types } = require('mongoose')

const ParticipantSchema = new Schema({
  id: { type: String },
  user_id: { type: String },
  user_name: { type: String },
  device: { type: String },
  ip_address: { type: String },
  location: { type: String },
  network_type: { type: String },
  data_center: { type: String },
  connection_type: { type: String },
  join_time: { type: Date },
  leave_time: { type: Date },
  share_application: { type: Boolean },
  share_desktop: { type: Boolean },
  share_whiteboard: { type: Boolean },
  recording: { type: Boolean },
  pc_name: { type: String },
  domain: { type: String },
  mac_addr: { type: String },
  harddisk_id: { type: String },
  version: { type: String },
  leave_reason: { type: String },
  email: { type: String },
  status: { type: String },
  customer_key: { type: String },
  sip_uri: { type: String },

  meeting_id: { type: Types.ObjectId, ref: 'Meeting' },
})

module.exports = model('Participant', ParticipantSchema)
