export const uniswapClient = new ApolloClient({
  link: new HttpLink({ uri: UNISWAP_SUBGRAPH_URL, fetch }),
  cache: new InMemoryCache()
})