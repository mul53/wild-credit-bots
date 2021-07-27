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
        query: fetchPriceQuery(address)
    })
    return result?.data?.token?.derivedETH 
}

exports.fetchPrice = fetchPrice
