import { ethers } from 'hardhat'
import { Cattestation__factory } from '../typechain-types'

const CATTESTATION = '0x87B253ab0a7ba6C7f273d5122C6246C444aDc517'

interface Cat {
    address: string
    catadata: {
        name: string
        description: string
        image: string
    }
}

const cats: Cat[] = [
    {
        address: '0xE38Bb1aa16C2017f9CC6aD02366ef7CBdf81cFfA',
        catadata: {
            name: 'Cattik',
            description: 'The face of MEWGlobal; pic by Jack',
            image: 'ipfs://bafybeid7wig3psxurmth7uel7kijgftwarl2ja5reu5th2lwgcmdietgbm',
        },
    },
    {
        address: '0x58E65eb0B3DAaBf27f473eD0017fed3C99959A6D',
        catadata: {
            name: 'Erbsensalat, the Teddy Cat',
            description: 'The cutest hacker; pic by Lilly',
            image: 'ipfs://bafybeid77slwccgbfov4hp2xdaqgfbnwhgqvmjryzhwpd72of6vb2572sy',
        },
    },
    {
        address: '0x08D0894175122d930c4fbD9D4d47949be2F488bB',
        catadata: {
            name: 'Tickat',
            description: 'No treats, no entry; pic by Remy',
            image: 'ipfs://bafybeide6betuk3jkl7m6vbmf6ruvk4goghuzj7v6algzsvi44bwufj2bi',
        },
    },
    {
        address: '0xEFF4A028797b917396845a3c90f66092D4a1B5A7',
        catadata: {
            name: 'Rug Cat',
            description: 'I dare you to pull his rug; pic by Nilufer',
            image: 'ipfs://bafybeiajn2mritz4jnoq67qiwskyurvcxhw25owrnvo2fstf3rmlszheka',
        },
    },
    {
        address: '0x6D882f43962aAD2A2C165d092eba863F0f9b34C5',
        catadata: {
            name: 'Cool Cat (?)',
            description: 'Fully anonywoof cat; pic by Rui',
            image: 'ipfs://bafybeiaayuu4untmqc3blkogsret4347g3mrtxjp6cx63byxh2xcbc7lke',
        },
    },
]

async function main() {
    const [deployer] = await ethers.getSigners()
    const cattestation = await Cattestation__factory.connect(
        CATTESTATION,
        deployer,
    ).waitForDeployment()

    // Ready
    for (const cat of cats) {
        await cattestation.register(cat.address, cat.catadata)
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
