const fetch = require('cross-fetch')
const { ApolloClient, InMemoryCache, HttpLink } = require('@apollo/client/core')
const { UNISWAP_SUBGRAPH_URL } = require('../constants')

const uniswapClient = new ApolloClient({
    link: new HttpLink({ uri: UNISWAP_SUBGRAPH_URL, fetch }),
    cache: new InMemoryCache()
})

exports.uniswapClient = uniswapClient
