const Discord = require('discord.js')
const numeral = require('numeral')
const { poll } = require('./utils/poll')
const { fetchETHUSDPrice } = require('./services/oracle')
const { fetchPrice } = require('./services/uniswap')
const { web3 } = require('./services/web3')
const { WILD_ADDRESS, TREASURY_ADDRESS, FOUNDER_VESTING_ADDRESS, STAKING_REWARDS_ADDRESS, REWARDS_DISTRIBUTION_ADDRESS, FACTORY_ADDRESS, UNISWAP_ORALCE_ADDRESS } = require('./constants')
const ERC20_ABI = require('./constants/abi/erc20.json')
const PAIR_FACTORY_ABI = require('./constants/abi/pairFactory.json')
const PAIR_ABI = require('./constants/abi/pair.json')
const UNISWAP_ORACLE_ABI = require('./constants/abi/uniswapV3Oracle.json')
const { default: BigNumber } = require('bignumber.js')

const bot = new Discord.Client()

const weiToNumber = (value, decimals = 18) => !value 
    ? 0 
    : new BigNumber(value).div(new BigNumber('10').pow(decimals))

const fetchPairs = async () => {
    const factory = new web3.eth.Contract(PAIR_FACTORY_ABI, FACTORY_ADDRESS)
    const pairs = await factory.getPastEvents('PairCreated', {
        fromBlock: 0,
        toBlock: 'latest'
    })
    return pairs.map(pair => ({ 
        pair: pair.returnValues.pair,
        tokenA: pair.returnValues.tokenA,
        tokenB: pair.returnValues.tokenB
    }))
}

const fetchPairUSDValue = async (pair) => {
    const { pair: pairAddress, tokenA, tokenB } = pair

    const pairContract = new web3.eth.Contract(PAIR_ABI, pairAddress)
    const tokenALP = await pairContract.methods.lpToken(tokenA).call()
    const tokenBLP = await pairContract.methods.lpToken(tokenB).call()

    const tokenALPContract = new web3.eth.Contract(ERC20_ABI, tokenALP)
    const tokenALPBalance = await tokenALPContract.methods.totalSupply().call()
    
    const tokenBLPContract = new web3.eth.Contract(ERC20_ABI, tokenBLP)
    const tokenBLPBalance = await tokenBLPContract.methods.totalSupply().call()

    const oracleContract = new web3.eth.Contract(UNISWAP_ORACLE_ABI, UNISWAP_ORALCE_ADDRESS)
    const tokenAUSD = await oracleContract.methods.tokenPrice(tokenA).call()
    const tokenBUSD = await oracleContract.methods.tokenPrice(tokenB).call()

    const tokenABalanceUSD = weiToNumber(tokenALPBalance) * weiToNumber(tokenAUSD)
    const tokenBBalanceUSD = weiToNumber(tokenBLPBalance) * weiToNumber(tokenBUSD)

    return tokenABalanceUSD + tokenBBalanceUSD
}


const fetchTvl = async () => {
    const pairs = await fetchPairs()
    
    let tvl = 0
    for (let pair of pairs) {
        const pairUSDValue = await fetchPairUSDValue(pair)
        tvl += pairUSDValue
    }

    return numeral(tvl).format('$0.0a')
}

const refreshTvl = async () => {
    try {
        const tvl = await fetchTvl()
        await bot.user.setActivity(tvl, { type: 'WATCHING' })
    } catch (e) {
        console.error('Failed to refresh tvl')
    }
}

bot.on('ready', () => {
    console.log('WildTvlBot ready...')
    poll({ fn: refreshTvl, interval: 60000 })
})


bot.login(process.env.BOT_TOKEN)
