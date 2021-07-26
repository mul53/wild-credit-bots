const BigNumber = require('bignumber.js')
const { web3 } = require("./web3")
const CHAINLINK_ORACLE_ABI = require("../../shared/constants/abi/chainlinkPriceFeed.json")
const { ETH_USD_ORACLE } = require('../constants')

const fetchETHUSDPrice = async () => {
    const oracle = new web3.eth.Contract(CHAINLINK_ORACLE_ABI, ETH_USD_ORACLE)
    const price = await oracle.methods.latestAnswer().call()
    const decimals = await oracle.methods.decimals().call()
    return new BigNumber(price).div(new BigNumber('10').pow(decimals)).toString()
}

exports.fetchETHUSDPrice = fetchETHUSDPrice
