const Discord = require('discord.js')
const { poll } = require('./utils/poll')
const { fetchETHUSDPrice } = require('./services/oracle')
const { fetchPrice } = require('./services/uniswap')
const { WILD_ADDRESS } = require('./constants')

const bot = new Discord.Client()

const fetchWildPrice = async () => {
    const ethUSD = await fetchETHUSDPrice()
    const wildEthValue = await fetchPrice(WILD_ADDRESS)
    return ethUSD * wildEthValue
}

const refreshWildPrice = async () => {
    const wildPrice = await fetchWildPrice()
    bot.user.setActivity(wildPrice, { type: 'WATCHING' })
}

bot.on('ready', () => {
    console.log('WildPriceBot ready...')
    poll({ fn: refreshWildPrice, interval: 15000 })
})

bot.login(process.env.BOT_TOKEN)
