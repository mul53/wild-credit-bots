const { Router } = require('express')
const pair = require('../../service/pair')

const router = Router()

router.get('/loanscan', async (req, res, next) => {
    try {
        const rates = await pair.getPairRates()
        const filteredRates = rates.filter(rate => rate.tokenSymbol === 'WETH')
        res.send(filteredRates)
    } catch (e) {
        next(e)
    }
})

module.exports = router
