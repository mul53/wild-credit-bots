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
    try {
        const wildPrice = await fetchWildPrice()
        const formattedWildPrice = wildPrice.toFixed(4).toString()
        
        await bot.user.setActivity(`$${formattedWildPrice}`, { type: 'WATCHING' })
    } catch (e) {
        console.error('Failed to refresh wild price')
    }
}

bot.on('ready', () => {
    console.log('WildPriceBot ready...')
    poll({ fn: refreshWildPrice, interval: 15000 })
})

bot.login(process.env.BOT_TOKEN)
