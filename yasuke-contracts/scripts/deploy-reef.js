async function main() {
    const myAccount = await hre.reef.getSignerByName("one");
    await myAccount.claimDefaultAccount();

    const signers = await hre.reef.getSigners();
    const [deployer] = await hre.reef.getSigners();

    let deployStore = true;
    let deployLegalTender = true;
    let storeAddress = "0xA34B45D9145Ab27F88170aA185291Cf6fafa83D8";
    let legalTenderAddress = "0x385D6203709018591Ddec4552fcff3627d7D21cD";

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    if (deployStore) {
        console.log("Deploying store. ");
        const Storage = await hre.reef.getContractFactory("Storage");
        const store = await Storage.deploy();
        await store.deployed();
        console.log("Store deployed to:", store.address);
        storeAddress = store.address;
    }

    if (deployLegalTender) {
        console.log("Deploying Legal Tender. ");
        const LegalTender = await hre.reef.getContractFactory("LegalTender");
        const legalTender = await LegalTender.deploy();
        await legalTender.deployed();
        console.log("Legal Tender deployed to:", legalTender.address);
        legalTenderAddress = legalTender.address;        
    }

    const Yasuke = await hre.reef.getContractFactory("Yasuke");
    yasuke = await Yasuke.deploy(storeAddress, legalTenderAddress);
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