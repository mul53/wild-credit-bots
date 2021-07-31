const { gql } = require('@apollo/client/core')
const { uniswapClient } = require("../graphql/client")

const fetchPriceQuery = (address) => {
    return gql`
        {
            token(id: "${address.toLowerCase()}") {
                derivedETH
            }
        }
    `
}

const fetchPrice = async (address) => {
    const result = await uniswapClient.query({
        query: fetchPriceQuery(address),
        fetchPolicy: 'no-cache'
    })
    return result?.data?.token?.derivedETH 
}

exports.fetchPrice = fetchPrice
