# bZx protocol subgraph
Steps to deploy the subgraph

1. Go to thegraph portal, authenticate using you github account
2. Create a new subgraph
3. Generate deployemnt key
4. yarn install
5. Configure subgraph.yaml:
    yarn prepare:mainnet-test
    or
    yarn prepare:mainnet
6. Generate models from abi
    yarn codgen
7. Authenticate in graph
    graph auth https://api.thegraph.com/deploy/ <graph key>
8. Deploy subgraph
    graph deploy <username>/<subgraphname> --debug --ipfs https://api.thegraph.com/ipfs/ --node https://api.thegraph.com/deploy/

    username and subgraphname you can get from graph portal url

Note: Once you start deployment you will not be able to stop the indexing process, for eg running it against mainnet could take more than 24 hours. mainnet-test runs much faster, it starts indexing from block 12093425

