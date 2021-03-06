# DXdao Refund 
A simple ETH refund contract to reimburse DXdao governance actions.

## Configure the Reimbursement configuration .env file

```
## REIMBURSEMENT CONFIGURATION ##

#mainnet | kovan | rinkeby | ropsten
NETWORK=mainnet

#Recommeded: Genesis Block of DAO
STARTING_BLOCK=11565019

#Set optional End block 
END_BLOCK=11595019

#Avatar
AVATAR_ADDRESS=0x519b70055af55a007110b4ff99b0ea33071c720a
SCHEME_REGISTRAR_ADDRESS=0xf050f3c6772ff35eb174a6900833243fccd0261f
GENESIS_PROTOCOL_ADDRESS=0x332b8c9734b4097de50f302f7d9f273ffdb45b84
REPUTATION_ADDRESS=0x7a927a93f221976aae26d5d077477307170f0b7c

#Refund Parameters i.E 100 = 100%, 15 = 15%
PROPOSAL_CREATION=90
STAKING=90
VOTING=90
REDEEM=90
EXECUTION=100
BOOSTING=100

## CONTRACT DEPLOYMENT ##

PRIVATE_KEY=xxx
INFURA_KEY="xxx"
```

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