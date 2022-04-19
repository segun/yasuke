async function main() {
    const storeAddress = '0x813E69E221fbA0CE9AF750e1c350a18CaE4a124E'
    const Yasuke = await ethers.getContractFactory('Yasuke')
    yasuke = await Yasuke.deploy(storeAddress)
    await yasuke.deployed()
    console.log('YASUKE deployed to:', yasuke.address)
    const a = await yasuke.upgrade(storeAddress)
    console.log(`Upgrade Successful with ${a}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
