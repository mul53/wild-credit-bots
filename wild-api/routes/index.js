const { Router } = require('express')
const integrations = require('./integrations')

const router = Router()

router.use('/integrations', integrations)

module.exports = router
