const { Router } = require('express')
const integrations = require('./integrations')

const router = Router()

router('/integrations', integrations)

module.exports = router
