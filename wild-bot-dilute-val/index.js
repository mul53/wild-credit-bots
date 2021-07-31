const Discord = require('discord.js')
const { poll } = require('./utils/poll')
const { fetchETHUSDPrice } = require('./services/oracle')
const { fetchPrice } = require('./services/uniswap')
const { web3 } = require('./services/web3')
const { WILD_ADDRESS } = require('./constants')
const ERC20_ABI = require('./constants/abi/erc20.json')
const { default: BigNumber } = require('bignumber.js')
const numeral = require('numeral')

const bot = new Discord.Client()

const fetchWildPrice = async () => {
    const ethUSD = await fetchETHUSDPrice()
    const wildEth = await fetchPrice(WILD_ADDRESS)
    const wildUSD = ethUSD * wildEth
    return wildUSD.toFixed(4).toString()
}

const fetchFullyDilutedValuation = async () => {
    const wildToken = new web3.eth.Contract(ERC20_ABI, WILD_ADDRESS)
    const totalSupply = await wildToken.methods.totalSupply().call()
    const wildPrice = await fetchWildPrice()
    const fullyDilutedValuation = new BigNumber(totalSupply)
        .multipliedBy(wildPrice)
        .div(new BigNumber('10').pow('18'))
        .toNumber()
    return numeral(parseInt(fullyDilutedValuation)).format('$0.0a')
}

const refreshFullyDilutedValuation = async () => {
    try {
        const tvl = await fetchFullyDilutedValuation()
        await bot.user.setActivity(tvl, { type: 'WATCHING' })
    } catch (e) {
        console.error('Failed to refresh fully diluted valuation')
    }
}

bot.on('ready', () => {
    console.log('WildDiluteValBot ready...')
    poll({ fn: refreshFullyDilutedValuation, interval: 15000 })
})

bot.login(process.env.BOT_TOKEN)
