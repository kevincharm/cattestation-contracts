import { ethers, run } from 'hardhat'
import { Cattestation__factory } from '../typechain-types'

const EAS_ARB1 = '0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458'
const EAS_MEOW_SCHEMA_ID = '0x8854730a24c711d4c862af13bcdc1a87c742c1d0b8fc39042287d2b844848efb'

async function main() {
    const [deployer] = await ethers.getSigners()
    const cattestationConstArgs = [EAS_ARB1, EAS_MEOW_SCHEMA_ID] as const
    const cattestation = await new Cattestation__factory(deployer)
        .deploy(...cattestationConstArgs)
        .then((contract) => contract.waitForDeployment())
    console.log(`Deployed: ${await cattestation.getAddress()}`)
    // Wait
    await new Promise((resolve) => setTimeout(resolve, 30_000))
    // Verify
    await run('verify:verify', {
        address: await cattestation.getAddress(),
        constructorArguments: cattestationConstArgs,
    })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
