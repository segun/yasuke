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


// Store deployed to: 0x47538d57b89e8a68edA04391D520103305338dB4
// Store Address: 0x47538d57b89e8a68edA04391D520103305338dB4
// Yasuke: 0xa0f3cE118aEC7b4188E033E7E7FeF0cc2280D84D