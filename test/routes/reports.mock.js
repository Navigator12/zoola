const { ObjectId } = require('mongoose').Types

const meetingMock = {
  uuid: 'uLkwUB7uRWy3ggSHxNbN0g==',
  id: 91851363096,
  topic: "Nir Ofir's Zoom Meeting",
  host: 'Nir Ofir',
  email: 'nir.ofir@uniper-care.com',
  user_type: 'Licensed',
  start_time: new Date('2021-08-20T07:19:35Z'),
  end_time: new Date('2021-08-20T08:03:48Z'),
  duration: '44:13',
  participants: 1,
  has_pstn: false,
  has_archiving: false,
  has_voip: true,
  has_3rd_party_audio: false,
  has_video: true,
  has_screen_share: true,
  has_recording: false,
  has_sip: false,

  _id: new ObjectId('123456789012345678901234'),
  participant_ids: [new ObjectId('123456789012345678901234')],
}

const participantMock = {
  id: 'C8EI7AxbRnyIDLQ6gB14Kg',
  user_id: '16778240',
  user_name: 'Nir',
  device: 'Mac',
  ip_address: '84.94.113.13',
  location: 'Tel Aviv (IL)',
  network_type: 'Wifi',
  microphone: 'MacBook Pro Microphone (MacBook Pro Microphone)',
  speaker: 'MacBook Pro Speakers (MacBook Pro Speakers)',
  camera: 'FaceTime HD Camera (Built-in)',
  data_center: 'Germany (FR Top)',
  connection_type: 'UDP',
  join_time: new Date('2021-08-20T07:19:35Z'),
  leave_time: new Date('2021-08-20T08:03:48Z'),
  share_application: false,
  share_desktop: false,
  share_whiteboard: false,
  recording: false,
  pc_name: 'Nir’s MacBook Pro',
  domain: 'Nirs-MacBook-Pro',
  mac_addr: 'A4:83:E7:BF:08:EE',
  harddisk_id: '3B54B770-8240-57F0-8E51-5B7880981500',
  version: '5.7.4.898',
  leave_reason: 'Nir Ofir left the meeting.<br>Reason: Host ended the meeting.',
  email: 'nir.ofir@uniper-care.com',
  status: 'in_meeting',
  customer_key: '',
  sip_uri: '',

  _id: new ObjectId('123456789012345678901234'),
  meeting_id: new ObjectId('123456789012345678901234'),
}

module.exports = {
  meetingMock,
  participantMock,
}
