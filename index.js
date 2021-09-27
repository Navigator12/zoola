const App = require('./app')

const startJobs = require('./schedulers/shedule')

const { MONGO, PORT } = process.env

const app = App(MONGO)

app.listen(PORT, () => console.log(`App has been started on port ${PORT}`))

startJobs().then()
