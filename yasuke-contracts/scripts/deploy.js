async function main() {

    const signers = await ethers.getSigners();
    const deployer = signers[0];

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const Storage = await ethers.getContractFactory("Storage");
    store = await Storage.deploy();
    await store.deployed();
    console.log("Store deployed to:", store.address);

    const Yasuke = await ethers.getContractFactory("Yasuke");
    yasuke = await Yasuke.deploy(store.address);
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