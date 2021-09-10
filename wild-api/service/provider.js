const Web3 = require("web3")
const { INFURA_URL } = require('../constants')

const web3 = new Web3(INFURA_URL)

exports.web3 = web3
