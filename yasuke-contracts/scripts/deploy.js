async function main() {

    const signers = await ethers.getSigners();
    const deployer = signers[0];

    let deployStore = true;
    let deployLegalTender = false;
    let storeAddress = "0xA34B45D9145Ab27F88170aA185291Cf6fafa83D8";
    let physicalStoreAddress = "";

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    if (deployStore) {
        console.log("Deploying store. ");
        const Storage = await ethers.getContractFactory("Storage");
        const store = await Storage.deploy();
        await store.deployed();
        console.log("Store deployed to:", store.address);
        storeAddress = store.address;

        console.log("Deploying physical store. ");
        const PhysicalArts = await ethers.getContractFactory("PhysicalArts");
        const physicalStore = await PhysicalArts.deploy();
        await physicalStore.deployed();
        console.log("Physical Store deployed to:", physicalStore.address);
        physicalStoreAddress = physicalStore.address;        
    }


    const Yasuke = await ethers.getContractFactory("Yasuke");
    yasuke = await Yasuke.deploy(storeAddress, physicalStoreAddress);
    await yasuke.deployed();
    console.log("YASUKE deployed to:", yasuke.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });