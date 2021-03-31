async function main() {

    const [deployer] = await ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const Yasuke = await ethers.getContractFactory("Yasuke");
    
    // TODO: enter store address in the constructor
    yasuke = await Yasuke.deploy('0x973141E3E8F4B1429FE847c1348693062b208C2f');

    await yasuke.deployed();
    console.log("YASUKE deployed to:", yasuke.address);
    
    console.log("Token address:", token.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });