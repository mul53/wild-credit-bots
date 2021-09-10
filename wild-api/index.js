const express = require('express')
const routes = require('./routes')

const app = express()

app.set('port', 3000)

app.use(routes)

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Internal Server Error')
})

app.listen(app.get('port'), () => {
    console.log('Listening on port', app.get('port'))
})