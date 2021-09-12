const { Router } = require('express')
const pair = require('../../service/pair')

const router = Router()

router.get('/loanscan', async (req, res, next) => {
    try {
        const pairRates = await pair.getRates()
        const data = {
            lendRates: [],
            borrowRates: []
        }
        
        for (const pairRate of pairRates) {
            const tokens = Object.keys(pairRate)

            for (const token of tokens) {
                if (token === 'WETH' || token === 'WBTC') continue

                const rate = pairRate[token]

                const lendRate = {
                    apy: rate.supplyApy,
                    apr: rate.supplyApr,
                    tokenSymbol: rate.tokenSymbol
                }

                const borrowRate = {
                    apy: rate.borrowApy,
                    apr: rate.borrowApr,
                    tokenSymbol: rate.tokenSymbol
                }

                data.lendRates.push(lendRate)
                data.borrowRates.push(borrowRate)
            }
        }

        res.json(data)
    } catch (e) {
        next(e)
    }
})

module.exports = router
