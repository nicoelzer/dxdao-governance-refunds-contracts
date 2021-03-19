# DXdao Refund 
A simple ETH refund contract to reimburse DXdao governance actions.

## Getting started

First clone the repository:

```sh
git clone https://github.com/nicoelzer/dxdao-governance-refunds-contracts.git
```

Move into the dxdao-governance-refunds-contracts working directory

```sh
cd dxdao-governance-refunds-contracts/
```

Install dependencies

```sh
yarn install
```

## Deploying Contracts

Create a new .env file in the main directory with the following variables:

```sh
PRIVATE_KEY=xxx
INFURA_KEY=xxx
```

Deploying contracts to xDai:
```sh
yarn deploy:xdai
```

Deploying contracts to Mainnet:
```sh
yarn deploy:mainnet
```