require("dotenv").config();
const Web3 = require("web3");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const gasSpendingAdapter = new FileSync("./src/data/gasSpendings.json");
const gasSpendingsDB = low(gasSpendingAdapter);
const overallSpendingAdapter = new FileSync("./src/data/overallSpendings.json");
const overallSpendingsDB = low(overallSpendingAdapter);
const schemeAdapter = new FileSync("./src/data/schemes.json");
const schemeDB = low(schemeAdapter);
const { contracts } = require("./src/data/baseContracts.js");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://${process.env.NETWORK}.infura.io/v3/${process.env.INFURA_KEY}`
  )
);
const {
  getEvents,
  upsertGasSpending,
  upsertAccountGasSpending,
} = require("./src/utils/utils.js");

async function calculateReimbursements() {
  const AccountGasSpendingAdapter = new FileSync(
    "./src/data/accountGasSpendings.json"
  );
  const AccountGasSpendingsDB = low(AccountGasSpendingAdapter);
  console.log("Starting to aggregate data");

  let uniqueAccounts = await AccountGasSpendingsDB.get(
    "accountGasSpendings"
  ).value();

  var reimbursementVotes = 0,
    reimbursementStakings = 0,
    reimbursementProposalCreations = 0,
    reimbursementExecutions = 0,
    reimbursementBoostings = 0,
    reimbursementRedeems = 0,
    totalReimbusement = 0;

  let addressesArr = [];
  let reimbursementArr = [];
  let actions = [];

  for (var u in uniqueAccounts) {
    reimbursementVotes =
      (uniqueAccounts[u].votesSpending / 100) * process.env.VOTING;
    reimbursementStakings =
      (uniqueAccounts[u].stakingSpending / 100) * process.env.STAKING;
    reimbursementProposalCreations =
      (uniqueAccounts[u].proposalCreationSpending / 100) *
      process.env.PROPOSAL_CREATION;
    reimbursementExecutions =
      (uniqueAccounts[u].executionSpending / 100) * process.env.EXECUTION;
    reimbursementBoostings =
      (uniqueAccounts[u].boostingSpending / 100) * process.env.BOOSTING;
    reimbursementRedeems = 
      (uniqueAccounts[u].redeemSpending / 100) * process.env.REDEEM;
    
      totalReimbusement =
      reimbursementVotes +
      reimbursementStakings +
      reimbursementProposalCreations +
      reimbursementExecutions +
      reimbursementBoostings +
      reimbursementRedeems;
    
      
    addressesArr.push(uniqueAccounts[u].id);
    reimbursementArr.push(totalReimbusement.toString());
    actions.push(uniqueAccounts[u].totalProposalCreations+";"+uniqueAccounts[u].totalVotes+";"+uniqueAccounts[u].totalStakings+";"+uniqueAccounts[u].totalExecutions+";"+uniqueAccounts[u].totalBoostings+";"+uniqueAccounts[u].totalRedeems);

    upsertAccountGasSpending(
      { id: uniqueAccounts[u].id },
      {
        reimbursementVotes: reimbursementVotes,
        reimbursementStakings: reimbursementStakings,
        reimbursementProposalCreations: reimbursementProposalCreations,
        reimbursementExecutions: reimbursementExecutions,
        reimbursementBoostings: reimbursementBoostings,
        reimbursementRedeems: reimbursementRedeems,
        totalReimbusement: totalReimbusement,
      }
    );
  }
  console.log("Reimbursment data to copy & paste:");
  console.log("Addresses:");
  console.log(JSON.stringify(addressesArr));
  console.log("Reimbursment amounts:");
  console.log(JSON.stringify(reimbursementArr));
  console.log("Actions");
  console.log(JSON.stringify(actions));
}

calculateReimbursements();
