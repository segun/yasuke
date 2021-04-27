async function main() {

    const signers = await ethers.getSigners();
    const deployer = signers[0];

    let deployStore = true;
    let storeAddress = undefined;

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    if (deployStore) {
        const Storage = await ethers.getContractFactory("Storage");
        store = await Storage.deploy();
        await store.deployed();
        console.log("Store deployed to:", store.address);
        storeAddress = store.address;
    }

    const Yasuke = await ethers.getContractFactory("Yasuke");
    yasuke = await Yasuke.deploy(storeAddress);
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