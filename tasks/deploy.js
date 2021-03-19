const { task } = require("hardhat/config");

task(
    "deploy",
    "Deploys the refund contract"
)
    .setAction(async (taskArguments, hre) => {

        /* Insert receiver & values Array here*/
        const receivers = ['0xabd238fa6b6042438fbd22e7d398199080b4224c','0xed6fa573b2ddb34f6a9a6941b53f7833bf283b02','0xb5806a701c2ae0366e15bde9be140e82190fa3d6','0x583acc79585d3cb195ea8125f6f80ad459b46313'];
        const values = ["2500000000000000000","1000000000000000000","10000000000000000","300000000000000000"];

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