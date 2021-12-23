async function main() {

    const signers = await ethers.getSigners();
    const deployer = signers[0];

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const Yasuke = await ethers.getContractFactory("Yasuke", deployer);
    
    // TODO: enter store address in the constructor
    yasuke = await Yasuke.deploy('0xBd770416a3345F91E4B34576cb804a576fa48EB1');

    await yasuke.deployed();
    console.log("YASUKE deployed to:", yasuke.address);    

    const a = await yasuke.testUpgrade();
    console.log(`Upgrade Successful with ${a}`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });