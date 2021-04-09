import { ApolloClient, InMemoryCache } from "@apollo/client";
const THEGRAPH_PROJECT_ID='QmdsUpXfMteQ3V5kwoQa5dLme53BeA8PGHqeTHgW3dAWmH'
const  THEGRAPH_API_URL='https://api.thegraph.com/subgraphs/id/'+THEGRAPH_PROJECT_ID;

export const client = new ApolloClient({
    uri: THEGRAPH_API_URL,
    cache: new InMemoryCache()
  });