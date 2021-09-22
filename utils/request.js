const axios = require('axios')

const { ZOOM_API_TOKEN } = process.env

const paginate = async (baseUrl, key, time) => {
  const { data } = await axios.get(baseUrl, {
    headers: {
      Authorization: `Bearer ${ZOOM_API_TOKEN}`,
    },
  })

  const array = data[key]

  const getNextData = (token, resolve) => {
    if (token) {
      setTimeout(async () => {
        const { data: nextData } = await axios.get(`${baseUrl}&next_page_token=${token}`, {
          headers: {
            Authorization: `Bearer ${ZOOM_API_TOKEN}`,
          },
        })

        array.push(...nextData[key])

        getNextData(nextData.next_page_token, resolve)
      }, time)
    } else resolve(array)
  }

  return new Promise((resolve) => getNextData(data.next_page_token, resolve))
}

const delay = async (time) => {
  await new Promise((resolve) => {
    setTimeout(() => resolve(), time)
  })
}

const doubleEncode = (str) => encodeURIComponent(encodeURIComponent(str))

module.exports = {
  paginate,
  delay,
  doubleEncode,
}
