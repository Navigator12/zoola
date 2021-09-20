const Meeting = require('../models/Meeting')
const Participant = require('../models/Participant')

class ReportsService {
  static async PerMemberReport(username) {
    const data = await Participant.aggregate([
      { $match: { user_name: username } },

      {
        $group: {
          _id: '$meeting_id',
          user_name: { $first: '$user_name' },
          user_id: { $first: '$user_id' },
          time: {
            $push: {
              join_time: '$join_time',
              leave_time: '$leave_time',
              amount: { $ceil: { $divide: [{ $subtract: ['$leave_time', '$join_time'] }, 1000 * 60] } },
              leave_reason: '$leave_reason',
            },
          },
        },
      },

      {
        $lookup: {
          from: 'meetings',
          localField: '_id',
          foreignField: '_id',
          as: 'meeting',
        },
      },

      { $unwind: '$meeting' },

      {
        $addFields: {
          total_time: { $sum: '$time.amount' },
          meet_duration: { $ceil: { $divide: [{ $subtract: ['$meeting.end_time', '$meeting.start_time'] }, 1000 * 60] } },
        },
      },

      {
        $addFields: {
          participation: { $multiply: [{ $divide: ['$total_time', '$meet_duration'] }, 100] },
        },
      },
    ])

    return data
  }

  static async PerMeetingReport(uuid) {
    const data = Meeting.aggregate([
      { $match: { uuid } },

      {
        $lookup: {
          from: 'participants',
          localField: 'participant_ids',
          foreignField: '_id',
          as: 'participants',
        },
      },

      { $unwind: '$participants' },

      {
        $group: {
          _id: {
            meeting: {
              uuid: '$uuid',
              id: '$id',
              topic: '$topic',
              host: '$host',
              start_time: '$start_time',
              end_time: '$end_time',
            },
            user_name: '$participants.user_name',
          },
          time: {
            $push: {
              join_time: '$participants.join_time',
              leave_time: '$participants.leave_time',
              amount: { $ceil: { $divide: [{ $subtract: ['$participants.leave_time', '$participants.join_time'] }, 1000 * 60] } },
              leave_reason: '$participants.leave_reason',
            },
          },
        },
      },

      {
        $addFields: {
          total_time: { $sum: '$time.amount' },
          meet_duration: { $ceil: { $divide: [{ $subtract: ['$_id.meeting.end_time', '$_id.meeting.start_time'] }, 1000 * 60] } },
        },
      },

      {
        $addFields: {
          participation: { $multiply: [{ $divide: ['$total_time', '$meet_duration'] }, 100] },
        },
      },

      {
        $group: {
          _id: { $mergeObjects: ['$_id.meeting', { meet_duration: '$meet_duration' }] },
          user: {
            $push: {
              user_name: '$_id.user_name',
              time: '$time',
              total_time: '$total_time',
              participation: '$participation',
            },
          },
        },
      },
    ])

    return data
  }
}

module.exports = ReportsService
