require("dotenv").config();
const Web3 = require("web3");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const gasSpendingAdapter = new FileSync("./src/data/gasSpendings.json");
const gasSpendingsDB = low(gasSpendingAdapter);
const schemeAdapter = new FileSync("./src/data/schemes.json");
const schemeDB = low(schemeAdapter);
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://${process.env.NETWORK}.infura.io/v3/${process.env.INFURA_KEY}`
  )
);
const {
  getEvents,
  upsertGasSpending,
  upsertAccountGasSpending,
  accountGasSpendingExists,
} = require("./src/utils/utils.js");
const baseContracts = require("./src/data/baseContracts.js");

async function fetchGasSpenings() {
  console.log("Started fetching transactions...");
  let scheme = await schemeDB.get("schemes").value();
  let filter = { _organization: process.env.AVATAR_ADDRESS };
  let latestBlock = await web3.eth.getBlockNumber();
  let votingMachines = [];
  for (var j in scheme) {
    if (
      !votingMachines.includes(scheme[j].votingMachineAddress) &&
      scheme[j].votingMachineAddress
    ) {
      console.log(
        `Searching for proposals on voting machine ${scheme[j].votingMachineAddress}`
      );
      let latestBlock = await web3.eth.getBlockNumber();
      let orgFilter = { _organization: process.env.AVATAR_ADDRESS };
      let boostingFilter = { _proposalState: "5" }

      if (scheme[j].votingMachineAddress) {
        votingMachines.push(scheme[j].votingMachineAddress);
        const votes = await getEvents(
          scheme[j].votingMachineAddress,
          process.env.STARTING_BLOCK,
          process.env.END_BLOCK ? process.env.END_BLOCK : latestBlock,
          "VoteProposal",
          orgFilter,
          JSON.parse(scheme[j].votingMachineAbi)
        );

        const stakes = await getEvents(
          scheme[j].votingMachineAddress,
          process.env.STARTING_BLOCK,
          process.env.END_BLOCK ? process.env.END_BLOCK : latestBlock,
          "Stake",
          orgFilter,
          JSON.parse(scheme[j].votingMachineAbi)
        );

        const proposalCreations = await getEvents(
          scheme[j].votingMachineAddress,
          process.env.STARTING_BLOCK,
          process.env.END_BLOCK ? process.env.END_BLOCK : latestBlock,
          "NewProposal",
          orgFilter,
          JSON.parse(scheme[j].votingMachineAbi)
        );

        const proposalExecutions = await getEvents(
          scheme[j].votingMachineAddress,
          process.env.STARTING_BLOCK,
          process.env.END_BLOCK ? process.env.END_BLOCK : latestBlock,
          "ExecuteProposal",
          orgFilter,
          JSON.parse(scheme[j].votingMachineAbi)
        );

        const proposalBoostings = await getEvents(
          scheme[j].votingMachineAddress,
          process.env.STARTING_BLOCK,
          process.env.END_BLOCK ? process.env.END_BLOCK : latestBlock,
          "StateChange",
          { _proposalState: "Boosted" },
          JSON.parse(scheme[j].votingMachineAbi)
        );

        const proposalRedeems = await getEvents(
          scheme[j].votingMachineAddress,
          process.env.STARTING_BLOCK,
          process.env.END_BLOCK ? process.env.END_BLOCK : latestBlock,
          "Redeem",
          orgFilter,
          JSON.parse(scheme[j].votingMachineAbi)
        );

        console.log(
          `Found ${votes.events.length} vote, ${stakes.events.length} staking, ${proposalCreations.events.length} proposalCreation, ${proposalExecutions.events.length} proposalExecution, ${proposalRedeems.events.length} proposalRedeems & ${proposalBoostings.events.length} boosting transactions.`
        );
        console.log(`Processing now...`);

        for (var i in votes.events) {
          var receipt = await web3.eth.getTransactionReceipt(
            votes.events[i].transactionHash
          );
          var tx = await web3.eth.getTransaction(
            votes.events[i].transactionHash
          );
          var block = await web3.eth.getBlock(votes.events[i].blockNumber);

          if(!accountGasSpendingExists({ id: votes.events[i].returnValues._voter.toLowerCase() })){
            upsertAccountGasSpending(
              { id: votes.events[i].returnValues._voter.toLowerCase() },
              {
                id: votes.events[i].returnValues._voter.toLowerCase(),
                totalVotes: 0,
                votesSpending: 0,
                totalStakings: 0,
                totalExecutions: 0,
                totalBoostings: 0,
                totalRedeems: 0,
                boostingSpending: 0,
                stakingSpending: 0,
                totalProposalCreations: 0,
                proposalCreationSpending: 0,
                executionSpending: 0,
                redeemSpending: 0,
              }
            );
          }

          if (receipt.status) {
            upsertGasSpending(
              { id: votes.events[i].transactionHash.toLowerCase()+"vote" },
              {
                id: votes.events[i].transactionHash.toLowerCase()+"creation",
                proposalId: votes.events[i].returnValues._proposalId,
                transactionHash: votes.events[i].transactionHash,
                from: votes.events[i].returnValues._voter.toLowerCase(),
                gas: receipt.gasUsed,
                gasPrice: parseInt(tx.gasPrice),
                gasTotal: receipt.gasUsed * tx.gasPrice,
                action: "voting",
                timestamp: block.timestamp,
              }
            );
          }
        }

        for (var i in proposalCreations.events) {
          var receipt = await web3.eth.getTransactionReceipt(
            proposalCreations.events[i].transactionHash
          );
          var tx = await web3.eth.getTransaction(
            proposalCreations.events[i].transactionHash
          );
          var block = await web3.eth.getBlock(
            proposalCreations.events[i].blockNumber
          );

          if(!accountGasSpendingExists({ id: proposalCreations.events[i].returnValues._proposer.toLowerCase() })){
            upsertAccountGasSpending(
              { id: proposalCreations.events[i].returnValues._proposer.toLowerCase() },
              {
                id: proposalCreations.events[i].returnValues._proposer.toLowerCase(),
                totalVotes: 0,
                votesSpending: 0,
                totalStakings: 0,
                totalExecutions: 0,
                totalBoostings: 0,
                totalRedeems: 0,
                boostingSpending: 0,
                stakingSpending: 0,
                totalProposalCreations: 0,
                proposalCreationSpending: 0,
                executionSpending: 0,
                redeemSpending: 0,
              }
            );
          }

          if (receipt.status) {
            upsertGasSpending(
              { id: proposalCreations.events[i].transactionHash.toLowerCase()+"creation" },
              {
                id: proposalCreations.events[i].transactionHash.toLowerCase()+"creation",
                proposalId:
                  proposalCreations.events[i].returnValues._proposalId,
                transactionHash: proposalCreations.events[i].transactionHash,
                from: proposalCreations.events[i].returnValues._proposer.toLowerCase(),
                gas: receipt.gasUsed,
                gasPrice: parseInt(tx.gasPrice),
                gasTotal: receipt.gasUsed * tx.gasPrice,
                action: "proposalCreation",
                timestamp: block.timestamp,
              }
            );
          }
        }

        for (var i in proposalExecutions.events) {
          var receipt = await web3.eth.getTransactionReceipt(
            proposalExecutions.events[i].transactionHash
          );
          var tx = await web3.eth.getTransaction(
            proposalExecutions.events[i].transactionHash
          );
          var block = await web3.eth.getBlock(
            proposalExecutions.events[i].blockNumber
          );

          let from;
          if(receipt.to != scheme[j].votingMachineAddress){
            from = receipt.to.toLowerCase();
          } else {
            from = receipt.from.toLowerCase();
          }

          if(!accountGasSpendingExists({ id: from.toLowerCase() })){
            upsertAccountGasSpending(
              { id: from.toLowerCase() },
              {
                id: from.toLowerCase(),
                totalVotes: 0,
                votesSpending: 0,
                totalStakings: 0,
                totalExecutions: 0,
                totalBoostings: 0,
                totalRedeems: 0,
                boostingSpending: 0,
                stakingSpending: 0,
                totalProposalCreations: 0,
                proposalCreationSpending: 0,
                executionSpending: 0,
                redeemSpending: 0,
              }
            );
          }

          if (receipt.status) {
            upsertGasSpending(
              { id: proposalExecutions.events[i].transactionHash.toLowerCase()+"executions" },
              {
                id: proposalExecutions.events[i].transactionHash.toLowerCase()+"executions",
                proposalId:
                  proposalExecutions.events[i].returnValues._proposalId,
                transactionHash: proposalExecutions.events[i].transactionHash,
                from: from.toLowerCase(),
                gas: receipt.gasUsed,
                gasPrice: parseInt(tx.gasPrice),
                gasTotal: receipt.gasUsed * tx.gasPrice,
                action: "proposalExecutions",
                timestamp: block.timestamp,
              }
            );
          }
        }

        for (var i in stakes.events) {
          var receipt = await web3.eth.getTransactionReceipt(
            stakes.events[i].transactionHash
          );
          var tx = await web3.eth.getTransaction(
            stakes.events[i].transactionHash
          );
          var block = await web3.eth.getBlock(stakes.events[i].blockNumber);

          if(!accountGasSpendingExists({ id: stakes.events[i].returnValues._staker.toLowerCase() })){
              upsertAccountGasSpending(
                { id: stakes.events[i].returnValues._staker.toLowerCase() },
                {
                  id: stakes.events[i].returnValues._staker.toLowerCase(),
                  totalVotes: 0,
                votesSpending: 0,
                totalStakings: 0,
                totalExecutions: 0,
                totalBoostings: 0,
                totalRedeems: 0,
                boostingSpending: 0,
                stakingSpending: 0,
                totalProposalCreations: 0,
                proposalCreationSpending: 0,
                executionSpending: 0,
                redeemSpending: 0,
                }
              );
          }

          if (receipt.status) {
            upsertGasSpending(
              { id: stakes.events[i].transactionHash.toLowerCase()+"stakes" },
              {
                id: stakes.events[i].transactionHash.toLowerCase()+"stakes",
                proposalId: stakes.events[i].returnValues._proposalId,
                transactionHash: stakes.events[i].transactionHash,
                from: stakes.events[i].returnValues._staker.toLowerCase(),
                gas: receipt.gasUsed,
                gasPrice: parseInt(tx.gasPrice),
                gasTotal: receipt.gasUsed * tx.gasPrice,
                action: "staking",
                timestamp: block.timestamp,
              }
            );
          }
        }

        for (var i in proposalRedeems.events) {

          var receipt = await web3.eth.getTransactionReceipt(
            proposalRedeems.events[i].transactionHash
          );
          var tx = await web3.eth.getTransaction(
            proposalRedeems.events[i].transactionHash
          );
          var block = await web3.eth.getBlock(proposalRedeems.events[i].blockNumber);

          let from = proposalRedeems.events[i].returnValues._beneficiary;

          if(!accountGasSpendingExists({ id: from.toLowerCase() })){
            upsertAccountGasSpending(
              { id: from.toLowerCase() },
              {
                id: from.toLowerCase(),
                totalVotes: 0,
                votesSpending: 0,
                totalStakings: 0,
                totalExecutions: 0,
                totalBoostings: 0,
                totalRedeems: 0,
                boostingSpending: 0,
                stakingSpending: 0,
                totalProposalCreations: 0,
                proposalCreationSpending: 0,
                executionSpending: 0,
                redeemSpending: 0,
              }
            );
          }

          if (receipt.status) {
            upsertGasSpending(
              { id: proposalRedeems.events[i].transactionHash.toLowerCase()+"vote" },
              {
                id: proposalRedeems.events[i].transactionHash.toLowerCase()+"creation",
                proposalId: proposalRedeems.events[i].returnValues._proposalId,
                transactionHash: proposalRedeems.events[i].transactionHash,
                from: from.toLowerCase(),
                gas: receipt.gasUsed,
                gasPrice: parseInt(tx.gasPrice),
                gasTotal: receipt.gasUsed * tx.gasPrice,
                action: "redeems",
                timestamp: block.timestamp,
              }
            );
          }
        }


        for (var b in proposalBoostings.events) {
          if(proposalBoostings.events[b].returnValues._proposalState == 5){
              var receipt = await web3.eth.getTransactionReceipt(
                proposalBoostings.events[b].transactionHash
              );
              var tx = await web3.eth.getTransaction(
                proposalBoostings.events[b].transactionHash
              );
              var block = await web3.eth.getBlock(proposalBoostings.events[b].blockNumber);

              let from;
              if(receipt.to != scheme[j].votingMachineAddress){
                from = receipt.to.toLowerCase();
              } else {
                from = receipt.from.toLowerCase();
              }

              proposalId = proposalBoostings.events[b].returnValues._proposalId;
              votingMachineAbi = await JSON.parse(scheme[j].votingMachineAbi);
              votingMachineAddress = await scheme[j].votingMachineAddress;

              var votingMachine = await new web3.eth.Contract(votingMachineAbi, votingMachineAddress);
              var organizationId = await votingMachine.methods.getProposalOrganization(proposalId).call();
              
              var org = await votingMachine.methods.organizations(organizationId).call();

              if(org.toLowerCase() == process.env.AVATAR_ADDRESS.toLowerCase()){

                  if(!accountGasSpendingExists({ id: from })){
                      upsertAccountGasSpending(
                        { id: from },
                        {
                          id: from,
                          totalVotes: 0,
                          votesSpending: 0,
                          totalStakings: 0,
                          totalExecutions: 0,
                          totalBoostings: 0,
                          totalRedeems: 0,
                          boostingSpending: 0,
                          stakingSpending: 0,
                          totalProposalCreations: 0,
                          proposalCreationSpending: 0,
                          executionSpending: 0,
                          redeemSpending: 0,
                        }
                      );
                  }

                  if (receipt.status) {
                    upsertGasSpending(
                      { id: proposalBoostings.events[b].transactionHash.toLowerCase()+"boosting" },
                      {
                        id: proposalBoostings.events[b].transactionHash.toLowerCase()+"boosting",
                        proposalId: proposalBoostings.events[b].returnValues._proposalId,
                        transactionHash: proposalBoostings.events[b].transactionHash,
                        from: from,
                        gas: receipt.gasUsed,
                        gasPrice: parseInt(tx.gasPrice),
                        gasTotal: receipt.gasUsed * tx.gasPrice,
                        action: "boosting",
                        timestamp: block.timestamp,
                      }
                    );
                  }

              }


            }
          }
      }
    }
  }

  console.log(
    `Transactions written to ./data/gasSpendings.json aggregating data now....`
  );
}

fetchGasSpenings();
