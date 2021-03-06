const Meeting = require('../models/Meeting')
const Participant = require('../models/Participant')

class ReportQueries {
  static async PerMemberData(username, from, to) {
    const data = await Participant.aggregate([
      {
        $match: {
          user_name: username,
          join_time: { $gte: from },
          leave_time: { $lt: to },
        },
      },

      {
        $group: {
          _id: '$meeting_id',
          user_name: { $first: '$user_name' },
          time: {
            $push: {
              user_id: '$user_id',
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
          meeting_duration: { $ceil: { $divide: [{ $subtract: ['$meeting.end_time', '$meeting.start_time'] }, 1000 * 60] } },
        },
      },

      {
        $addFields: {
          participation: { $multiply: [{ $divide: ['$total_time', '$meeting_duration'] }, 100] },
        },
      },

      { $unwind: '$time' },

      { $sort: { 'time.join_time': 1 } },
    ])

    return data
  }

  static async PerMeetingData(id, from, to) {
    const data = await Meeting.aggregate([
      {
        $match: {
          id: Number.parseInt(id, 10),
          start_time: { $gte: from },
          end_time: { $lt: to },
        },
      },

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
              user_id: '$participants.user_id',
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
          meeting_duration: { $ceil: { $divide: [{ $subtract: ['$_id.meeting.end_time', '$_id.meeting.start_time'] }, 1000 * 60] } },
        },
      },

      {
        $addFields: {
          participation: { $multiply: [{ $divide: ['$total_time', '$meeting_duration'] }, 100] },
        },
      },

      { $unwind: '$time' },

      {
        $group: {
          _id: { $mergeObjects: ['$_id.meeting', { meeting_duration: '$meeting_duration' }] },
          users: {
            $push: {
              user_name: '$_id.user_name',
              time: '$time',
              total_time: '$total_time',
              participation: '$participation',
            },
          },
        },
      },

      { $sort: { '_id.start_time': 1 } },
    ])

    return data
  }
}

module.exports = ReportQueries
