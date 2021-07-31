const Discord = require('discord.js')
const { poll } = require('./utils/poll')
const { fetchETHUSDPrice } = require('./services/oracle')
const { fetchPrice } = require('./services/uniswap')
const { web3 } = require('./services/web3')
const { WILD_ADDRESS, TREASURY_ADDRESS, FOUNDER_VESTING_ADDRESS, STAKING_REWARDS_ADDRESS, REWARDS_DISTRIBUTION_ADDRESS } = require('./constants')
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

const fetchCirculationSupply = async () => {
    const wildToken = new web3.eth.Contract(ERC20_ABI, WILD_ADDRESS)

    const totalSupply = await wildToken.methods.totalSupply().call()
    const treasuryBalance = await wildToken.methods.balanceOf(TREASURY_ADDRESS).call()
    const founderVestingBalance = await wildToken.methods.balanceOf(FOUNDER_VESTING_ADDRESS).call()
    const stakingBalance = await wildToken.methods.balanceOf(STAKING_REWARDS_ADDRESS).call()
    const rewardsBalance = await wildToken.methods.balanceOf(REWARDS_DISTRIBUTION_ADDRESS).call()

    return new BigNumber(totalSupply)
        .minus(treasuryBalance)
        .minus(founderVestingBalance)
        .minus(stakingBalance)
        .minus(rewardsBalance)
        .div(new BigNumber('10').pow('18'))
        .toNumber()
}

const fetchMktCap = async () => {
    const wildPrice = await fetchWildPrice()
    const circulationSupply = await fetchCirculationSupply()
    const mktCap = wildPrice * circulationSupply
    return numeral(parseInt(mktCap)).format('$0.0a')
}

const refreshMktCap = async () => {
    try {
        const marketCap = await fetchMktCap()
        await bot.user.setActivity(marketCap, { type: 'WATCHING' })
    } catch (e) {
        console.error('Failed to refresh fully diluted valuation')
    }
}

bot.on('ready', () => {
    console.log('WildMktCapBot ready...')
    poll({ fn: refreshMktCap, interval: 60000 })
})

bot.login(process.env.BOT_TOKEN)
