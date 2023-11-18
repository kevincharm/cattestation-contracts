import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Cattestation, Cattestation__factory, IEAS, IEAS__factory } from '../typechain-types'
import { Signature, TypedDataDomain } from 'ethers'

const EAS_SEPOLIA = '0xC2679fBD37d54388Ce493F1DB75320D236e1815e'
const EAS_PET_SCHEMA_ID_SEPOLIA =
    '0x8854730a24c711d4c862af13bcdc1a87c742c1d0b8fc39042287d2b844848efb'

async function getEip712Domain(address: string): Promise<TypedDataDomain> {
    const chainId = await ethers.provider.getNetwork().then((network) => network.chainId)
    return {
        name: 'Cattestation',
        version: '1',
        chainId,
        verifyingContract: address,
    }
}

const CATTESTATION_MEOW_TYPE = {
    Meow: [
        {
            type: 'address',
            name: 'human',
        },
        {
            type: 'string',
            name: 'message',
        },
    ],
}

describe('Cattestation', () => {
    let deployer: SignerWithAddress
    let mehmet: SignerWithAddress
    let luna: SignerWithAddress
    let simba: SignerWithAddress
    let cattestation: Cattestation
    let eas: IEAS
    beforeEach(async () => {
        ;[deployer, mehmet, luna, simba] = await ethers.getSigners()
        cattestation = await new Cattestation__factory(deployer).deploy(
            EAS_SEPOLIA,
            EAS_PET_SCHEMA_ID_SEPOLIA,
        )
        eas = await IEAS__factory.connect(EAS_SEPOLIA, deployer).waitForDeployment()
    })

    it('attests a meow', async () => {
        const lunasCatadata = {
            name: 'Luna',
            description: 'Luna enjoys moonbathing in Taksim Square',
            image: 'ipfs://luna.jpg',
        }
        // Register cat
        await cattestation.register(luna.address, lunasCatadata)
        expect(await cattestation.isKawaii(luna.address)).to.eq(true)

        const human = mehmet.address
        const message = 'cok guzel'

        // Sign EIP-712 payload
        const sig = await luna.signTypedData(
            await getEip712Domain(await cattestation.getAddress()),
            CATTESTATION_MEOW_TYPE,
            {
                human,
                message,
            },
        )
        const { v, r, s } = Signature.from(sig)
        // Submit attestation
        await cattestation.pet(human, message, { v, r, s })

        // Get tokenURI (onchain base64-encoded json)
        const rawCatadata = await cattestation.tokenURI(1)
        const BASE64_JSON_PREAMBLE = 'data:application/json;base64,'
        expect(rawCatadata.startsWith(BASE64_JSON_PREAMBLE)).to.eq(true)

        // Decode base64 -> string -> parse json
        const catadata = JSON.parse(atob(rawCatadata.slice(BASE64_JSON_PREAMBLE.length)))
        expect(catadata).to.deep.eq(lunasCatadata)
    })
})
