const BigNumber = require('bignumber.js')
const { web3 } = require("./provider")
const { POOL_FACTORY_ADDRESS } = require("../constants")
const POOL_FACTORY_ABI = require("../constants/abis/poolFactory.json")
const PAIR_ABI = require('../constants/abis/pair.json')
const TOKEN_ABI = require('../constants/abis/erc20.json')

module.exports = {
    getPoolContract() {
        return new web3.eth.Contract(POOL_FACTORY_ABI, POOL_FACTORY_ADDRESS)
    },

    getPairContract(pairAddress) {
        return new web3.eth.Contract(PAIR_ABI, pairAddress)
    },

    getTokenContract(tokenAddress) {
        return new web3.eth.Contract(TOKEN_ABI, tokenAddress)
    },

    async getCreatedPairs() {
        const poolContract = this.getPoolContract()
        const events = await poolContract.getPastEvents('PairCreated', {
            fromBlock: 0,
            toBlock: 'latest'
        })
        return events.map(e => {
            return {
                pairAddress: e.returnValues.pair,
                tokenA: e.returnValues.tokenA,
                tokenB: e.returnValues.tokenB ,
            }
        })
    },

    async getPairRates({ pairAddress, tokenA, tokenB }) {
        const rates = {}
        const pairContract = this.getPairContract(pairAddress)

        for (const token of [tokenA, tokenB]) {

            const borrowApr = new BigNumber(await pairContract.methods.borrowRatePerBlock(token).call())
                .dividedBy(13.2)
                .multipliedBy(3600)
                .multipliedBy(24)
                .multipliedBy(365)
                .dividedBy(1e18)
                .dividedBy(100)
                .toNumber()
            const supplyApr = new BigNumber(await pairContract.methods.supplyRatePerBlock(token).call())
                .dividedBy(13.2)
                .multipliedBy(3600)
                .multipliedBy(24)
                .multipliedBy(365)
                .dividedBy(1e18)
                .dividedBy(100)
                .toNumber()

            const borrowApy = ((1 + borrowApr / 365) ** 365) - 1
            const supplyApy = ((1 + supplyApr / 365) ** 365) - 1
            
            let tokenSymbol
            if (token === '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2') {
                tokenSymbol = 'MKR'
            } else {
                tokenSymbol = await this.getTokenContract(token).methods.symbol().call()
            }
    
            rates[tokenSymbol] = {
                borrowApr,
                borrowApy,
                supplyApr,
                supplyApy,
                tokenSymbol
            }
        }

        return rates
    },

    async getRates() {
        const pairs = await this.getCreatedPairs()
        const rates = []

        for (const pair of pairs) {
            rates.push(await this.getPairRates(pair))
        }

        return rates
    }
}