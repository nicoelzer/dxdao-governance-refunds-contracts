const { task } = require("hardhat/config");

task(
    "deploy",
    "Deploys the refund contract"
)
    .addFlag(
      "verify",
      "Additional (and optional) Etherscan contracts verification"
    )
    .setAction(async (taskArguments, hre) => {
        const { verify } = taskArguments;

        /* Insert receiver & values Array here*/
        const receivers = ["0xabd238fa6b6042438fbd22e7d398199080b4224c","0xed6fa573b2ddb34f6a9a6941b53f7833bf283b02","0xb33b9fba681653fe263b31a95766d83d18c2128d","0x583acc79585d3cb195ea8125f6f80ad459b46313","0x08eec580ad41e9994599bad7d2a74a9874a2852c","0x35e2acd3f46b13151bc941daa44785a38f3bd97a","0x332b8c9734b4097de50f302f7d9f273ffdb45b84","0xb435871b0959561226b4d903b1abf79528177e81","0x406bfd9cdb247432feea52edd218f2a4bd238c9b"];
        const values = ["221226106501557440","92264286557128050","69666836400584000","155140616431447420","149922981967483460","28082232000000000","229766382000000000","16530696000000000","5746005000000000"];

        await hre.run("clean");
        await hre.run("compile");

        const ETHRefund = hre.artifacts.require(
            "ETHRefund"
        );
        const ethRefund = await ETHRefund.new(
          receivers,
          values
        );

        if(verify) {
            await hre.run("verify", {
                address: ethRefund.address,
                constructorArguments: [receivers,
                  values,],
            });
        }

        console.log(`refund contract deployed at address ${ethRefund.address}`);
        if(verify) {
            console.log(`source code verified`);
        }
    });