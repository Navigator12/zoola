const { xlsxDateFormat, xlsxTimeFormat, xlsxLeaveReasonFormat } = require('../utils')

const perMemberQueryMapper = (data) => data.map((d) => ({
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

const perMeetingQueryMapper = (data) => data.map((d) => ({
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

module.exports = {
  perMemberQueryMapper,
  perMeetingQueryMapper,
}
