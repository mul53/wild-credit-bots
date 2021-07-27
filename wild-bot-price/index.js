const Discord = require('discord.js')
const { poll } = require('wild-bot-shared/utils/poll')
const { fetchETHUSDPrice } = require('wild-bot-shared/services/oracle')
const { fetchPrice } = require('wild-bot-shared/services/uniswap')
const { WILD_ADDRESS } = require('wild-bot-shared/constants')

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
