async function main() {

    const signers = await ethers.getSigners();
    
    const deployer = signers[0];
    console.log(deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    console.log("Deploying store. ");
    const Storage = await ethers.getContractFactory("Storage");
    store = await Storage.deploy();
    await store.deployed();
    console.log("Store deployed to:", store.address);
    storeAddress = store.address;


    console.log(`Store Address: ${storeAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });