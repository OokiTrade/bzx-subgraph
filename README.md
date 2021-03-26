# bZx protocol subgraph
Steps to deploy the subgraph

1. Go to thegraph portal, authenticate using you github account
2. Create a new subgraph
3. Generate deployemnt key
4. yarn install
5. Configure subgraph.yaml:
    yarn prepare:mainnet 
    or
    yarn prepare:kovan
6. Generate models from abi
    yarn codgen
7. Authenticate in graph
    graph auth https://api.thegraph.com/deploy/ <graph key>
8. Deploy subgraph
    graph deploy <username>/<subgraphname> --debug --ipfs https://api.thegraph.com/ipfs/ --node https://api.thegraph.com/deploy/

    username and subgraphname you can get from graph portal url

