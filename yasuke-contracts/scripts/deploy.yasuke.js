const { ethers } = require('hardhat')

async function main() {
    const storeAddress = '0x17D49b37d9391BD3734f75b57F38778fC8a3BbCd'

    const signers = await ethers.getSigners()
    const deployer = signers[0]

    console.log('Deploying contracts with the account:', deployer.address)

    console.log('Account balance:', (await deployer.getBalance()).toString())

    const Yasuke = await ethers.getContractFactory('Yasuke', deployer)
    
    yasuke = await Yasuke.deploy(storeAddress)

    await yasuke.deployed()
    console.log('YASUKE deployed to:', yasuke.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
