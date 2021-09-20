const { ObjectId } = require('mongoose').Types

const { paginate, delay, doubleEncode } = require('../utils/utils')

const Meeting = require('../models/Meeting')
const Participant = require('../models/Participant')

const { ZOOM_API } = process.env

class MetricsService {
  static async CreateMeetings(from, to) {
    const baseUrl = `${ZOOM_API}/metrics/meetings/?type=past&from=${from}&to=${to}`
    const meetings = await paginate(baseUrl, 'meetings', 3000)

    for (const m of meetings) {
      const meeting = new Meeting({
        ...m,
        start_time: new Date(m.start_time),
        end_time: new Date(m.end_time),
      })

      meeting.save()
        .then(async () => {
          const ids = await this.CreateParticipants(meeting.uuid, meeting._id)
          meeting.participant_ids = ids
          await meeting.save()
        })
        // TODO: handle invalid meetings
        .catch(() => {})

      await delay(3000)
    }
  }

  static async CreateParticipants(uuid, _id) {
    const baseUrl = `${ZOOM_API}/metrics/meetings/${doubleEncode(uuid)}/participants/?type=past`

    const participants = await paginate(baseUrl, 'participants', 3000)

    const ids = []

    for (const p of participants) {
      const participant = new Participant({
        ...p,
        join_time: new Date(p.join_time),
        leave_time: new Date(p.leave_time),
        meeting_id: new ObjectId(_id),
      })

      await participant.save()

      ids.push(participant._id)
    }

    return ids
  }
}

module.exports = MetricsService
