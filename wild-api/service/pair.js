const BigNumber = require('bignumber.js')
const { web3 } = require("./provider")
const { POOL_FACTORY_ADDRESS } = require("../constants")
const POOL_FACTORY_ABI = require("../constants/abis/poolFactory.json")
const PAIR_ABI = require('../constants/abis/pair.json')
const TOKEN_ABI = require('../constants/abis/erc20.json')

module.exports = {
    getPoolContract() {
        return web3.eth.Contract(POOL_FACTORY_ABI, POOL_FACTORY_ADDRESS)
    },

    getPairContract(pairAddress) {
        return web3.eth.Contract(PAIR_ABI, pairAddress)
    },

    getTokenContract(tokenAddress) {
        return web3.eth.Contract(TOKEN_ABI, tokenAddress)
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
        const tokenRates = []
        const pairContract = this.getPairContract(pairAddress) 

        for (const token of [tokenA, tokenB]) {
            const borrowRate = new BigNumber(await pairContract.methods.borrowRatePerBlock(token).call())
                .dividedBy(13.2)
                .multipliedBy(3600)
                .multipliedBy(24)
                .multipliedBy(365)
                .dividedBy(1e18)
            const supplyRate = new BigNumber(await pairContract.methods.supplyRatePerBlock(token).call())
                .dividedBy(13.2)
                .multipliedBy(3600)
                .multipliedBy(24)
                .multipliedBy(365)
                .dividedBy(1e18)
            const apr = borrowRate.plus(supplyRate)
            const apy = new BigNumber(new BigNumber(1).plus(apr).dividedBy(365).pow(365)).minus(1)
            const tokenSymbol = await this.getTokenContract().methods.symbol().call()
    
            tokenRates.push({
                borrowRate,
                supplyRate,
                apr,
                apy,
                tokenSymbol
            })
        }

        return tokenRates
    }
}