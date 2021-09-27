const { app, request } = require('../app')

const Meeting = require('../../models/Meeting')
const Participant = require('../../models/Participant')
const Report = require('../../models/Report')

const { meetingMock, participantMock } = require('./reports.mock')

beforeEach(async () => {
  await Report.deleteMany()
  await Meeting.deleteMany()
  await Participant.deleteMany()

  await new Meeting(meetingMock).save()
  await new Participant(participantMock).save()
})

afterEach(async () => {
  await Report.deleteMany()
  await Meeting.deleteMany()
  await Participant.deleteMany()
})

describe('report tests', () => {
  it('should return link for member report', async () => {
    const res = await request(app)
      .get('/api/reports/per_member/Nir?to=2021-9-26')
      .send()

    expect(res.statusCode).toBe(200)

    const data = JSON.parse(res.text)

    expect(data).toHaveProperty('link')
    expect(data.link).toContain('/reports/Nir_1970-1-1_2021-9-26.xlsx')
  })

  it('should fail with not found member', async () => {
    const res = await request(app)
      .get('/api/reports/per_member/nothing?to=2021-9-26')
      .send()

    expect(res.statusCode).toBe(404)

    const data = JSON.parse(res.text)

    expect(data).toHaveProperty('error')
    expect(data.error).toBe('The member does not exist')
  })

  it('should return link for meeting report', async () => {
    const res = await request(app)
      .get('/api/reports/per_meeting/91851363096?to=2021-9-26')
      .send()

    expect(res.statusCode).toBe(200)

    const data = JSON.parse(res.text)

    expect(data).toHaveProperty('link')
    expect(data.link).toContain('/reports/Meeting 91851363096_1970-1-1_2021-9-26.xlsx')
  })

  it('should fail with not found meeting', async () => {
    const res = await request(app)
      .get('/api/reports/per_meeting/0?to=2021-9-26')
      .send()

    expect(res.statusCode).toBe(404)

    const data = JSON.parse(res.text)

    expect(data).toHaveProperty('error')
    expect(data.error).toBe('The meeting does not exist')
  })
})
