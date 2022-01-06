import * as chai from 'chai'
import { ethers } from 'hardhat'
import chaiAsPromised from 'chai-as-promised'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Rewards, GrapeToken, StakingToken } from '../generated'
import { MerkleTree } from 'merkletreejs'
import keccak256 from 'keccak256'
import { solidityKeccak256 } from 'ethers/lib/utils'

chai.use(chaiAsPromised)

const { expect } = chai

let GrapeTokenFactory
let grapeToken: GrapeToken

let StakingTokenFactory
let stakingToken: StakingToken

let RewardsFactory
let rewardsContract: Rewards

let owner: SignerWithAddress
let daoAcc: SignerWithAddress
let acc1: SignerWithAddress
let acc2: SignerWithAddress
let acc3: SignerWithAddress
let acc4: SignerWithAddress
let addrs: SignerWithAddress[] = []
let merkleTree: MerkleTree

const THOUSAND_ETH = ethers.utils.parseEther('1000').toString()
const generateLeaf = (address: string, value: string) =>
  Buffer.from(
    // Hash in appropriate Merkle format
    solidityKeccak256(['address', 'uint256'], [address, value]).slice(2),
    'hex'
  )

const transferToStaking = (addr: string, amount: string) =>
  stakingToken.transfer(addr, ethers.utils.parseEther(amount), {
    from: owner.address,
  })

describe('Grape', function () {
  beforeEach(async function () {
    ;[owner, daoAcc, acc1, acc2, acc3, acc4, ...addrs] =
      await ethers.getSigners()

    GrapeTokenFactory = await ethers.getContractFactory('GrapeToken')
    grapeToken = (await GrapeTokenFactory.deploy(daoAcc.address)) as GrapeToken

    StakingTokenFactory = await ethers.getContractFactory('StakingToken')
    stakingToken = (await StakingTokenFactory.deploy()) as StakingToken

    merkleTree = new MerkleTree(
      [
        generateLeaf(acc1.address, THOUSAND_ETH),
        generateLeaf(acc2.address, THOUSAND_ETH),
      ],
      keccak256,
      { sortPairs: true }
    )

    RewardsFactory = await ethers.getContractFactory('Rewards')
    rewardsContract = (await RewardsFactory.deploy(
      grapeToken.address,
      stakingToken.address,
      merkleTree.getRoot()
    )) as Rewards

    const role = await grapeToken.MINTER_ROLE()
    await grapeToken.grantRole(role, rewardsContract.address)

    // Reset block timestamp
    const blockNumber = ethers.provider.getBlockNumber()
    const block = await ethers.provider.getBlock(blockNumber)
    const currentTimestamp = Math.floor(new Date().getTime() / 1000)
    const secondsDiff = currentTimestamp - block.timestamp
    await ethers.provider.send('evm_increaseTime', [secondsDiff])
    await ethers.provider.send('evm_mine', [])
  })

  describe('grape token', () => {
    it('have tax', async function () {
      await grapeToken.mint(acc1.address, ethers.utils.parseEther('100'))

      expect(
        ethers.utils.formatEther(await grapeToken.balanceOf(daoAcc.address))
      ).to.equal('3.3')
      await grapeToken.mint(acc1.address, ethers.utils.parseEther('100'))

      expect(
        ethers.utils.formatEther(await grapeToken.balanceOf(daoAcc.address))
      ).to.equal('6.6')

      await grapeToken.setTaxAmount('300')
      await grapeToken.mint(acc1.address, ethers.utils.parseEther('100'))
      expect(
        ethers.utils.formatEther(await grapeToken.balanceOf(daoAcc.address))
      ).to.equal('9.6')
    })

    it('should remove tax if needed', async () => {
      await grapeToken.mint(acc1.address, ethers.utils.parseEther('100'))
      expect(
        ethers.utils.formatEther(await grapeToken.balanceOf(daoAcc.address))
      ).to.equal('3.3')

      await grapeToken.setTaxAddress(
        '0x0000000000000000000000000000000000000000'
      )
      await grapeToken.mint(acc1.address, ethers.utils.parseEther('100'))
      expect(
        ethers.utils.formatEther(await grapeToken.balanceOf(daoAcc.address))
      ).to.equal('3.3')
    })

    it('can burn', async () => {
      await grapeToken.mint(acc1.address, ethers.utils.parseEther('100'))
      let balance = await grapeToken.balanceOf(acc1.address)
      expect(ethers.utils.formatEther(balance)).to.equal('100.0')

      let errorMessage
      try {
        await grapeToken.burn(acc1.address, balance.toString())
      } catch (e: any) {
        errorMessage = e.message
      }

      expect(errorMessage).to.include(
        'Cant burn the token. Time is not ready yet.'
      )

      expect(
        ethers.utils.formatEther(await grapeToken.balanceOf(acc1.address))
      ).to.equal('100.0')

      await grapeToken.setBurnableTimestamp(
        Math.floor(new Date().getTime() / 1000) + 1000
      )
      await ethers.provider.send('evm_increaseTime', [60 * 1000])
      await ethers.provider.send('evm_mine', [])
      await grapeToken.burn(acc1.address, balance.toString())
      expect(
        ethers.utils.formatEther(await grapeToken.balanceOf(acc1.address))
      ).to.equal('0.0')
    })

    it('can transfer ownership', async () => {
      const MINTER_ROLE = await grapeToken.MINTER_ROLE()
      const BURNER_ROLE = await grapeToken.BURNER_ROLE()
      const DEFAULT_ADMIN_ROLE = await grapeToken.DEFAULT_ADMIN_ROLE()
      const PAUSER_ROLE = await grapeToken.PAUSER_ROLE()

      let result = await Promise.all([
        grapeToken.hasRole(MINTER_ROLE, owner.address),
        grapeToken.hasRole(BURNER_ROLE, owner.address),
        grapeToken.hasRole(DEFAULT_ADMIN_ROLE, owner.address),
        grapeToken.hasRole(PAUSER_ROLE, owner.address),
      ])

      expect(result.every((val) => val)).to.equal(true)
      await grapeToken.transferOwnership(acc1.address)

      result = await Promise.all([
        grapeToken.hasRole(MINTER_ROLE, owner.address),
        grapeToken.hasRole(BURNER_ROLE, owner.address),
        grapeToken.hasRole(DEFAULT_ADMIN_ROLE, owner.address),
        grapeToken.hasRole(PAUSER_ROLE, owner.address),
      ])

      expect(result.every((val) => !val)).to.equal(true)

      result = await Promise.all([
        grapeToken.hasRole(MINTER_ROLE, acc1.address),
        grapeToken.hasRole(BURNER_ROLE, acc1.address),
        grapeToken.hasRole(DEFAULT_ADMIN_ROLE, acc1.address),
        grapeToken.hasRole(PAUSER_ROLE, acc1.address),
      ])
      expect(result.every((val) => val)).to.equal(true)
    })
  })

  describe('Rewards', () => {
    it('should have merkle tree for initial airdrop', async () => {
      const leaf = generateLeaf(acc1.address, THOUSAND_ETH)
      const proof = merkleTree.getHexProof(leaf)
      const amount = ethers.utils.parseEther('1000')
      await rewardsContract.initialClaim(acc1.address, amount, proof)
      const balance = await grapeToken.balanceOf(acc1.address)
      expect((await grapeToken.balanceOf(acc1.address)).eq(amount)).to.equal(
        true
      )
    })

    it('should give out correct amount', async () => {
      await transferToStaking(acc1.address, '1')
      await transferToStaking(acc2.address, '200')
      await transferToStaking(acc3.address, '0.5')
      await transferToStaking(acc4.address, '22.64')

      expect(
        (await rewardsContract.getAmount(acc3.address)).toString()
      ).to.equal(ethers.utils.parseEther('80').toString())

      expect(
        (await rewardsContract.getAmount(acc1.address)).toString()
      ).to.equal(ethers.utils.parseEther('80.16').toString())

      expect(
        (await rewardsContract.getAmount(acc2.address)).toString()
      ).to.equal(ethers.utils.parseEther('92').toString())

      expect(
        (await rewardsContract.getAmount(acc4.address)).toString()
      ).to.equal(ethers.utils.parseEther('83.6224').toString())

      await rewardsContract.setClaimBonusNumerator(40)

      expect(
        (await rewardsContract.getAmount(acc3.address)).toString()
      ).to.equal(ethers.utils.parseEther('80').toString())

      expect(
        (await rewardsContract.getAmount(acc2.address)).toString()
      ).to.equal(ethers.utils.parseEther('104').toString())
    })

    it('should recieve Grapes', async () => {
      await transferToStaking(acc1.address, '1')
      await transferToStaking(acc2.address, '1')
      const acc1InitialBalance = await grapeToken.balanceOf(acc1.address)
      const acc2InitialBalance = await grapeToken.balanceOf(acc2.address)

      await Promise.all([
        rewardsContract.connect(acc1).claim(),
        rewardsContract.connect(acc2).claim(),
      ])
      const acc1UpdatedBalance = await grapeToken.balanceOf(acc1.address)
      const acc2UpdatedBalance = await grapeToken.balanceOf(acc2.address)

      expect(acc1InitialBalance.lt(acc1UpdatedBalance)).to.equal(true)
      expect(acc2InitialBalance.lt(acc2UpdatedBalance)).to.equal(true)
    })

    it('should be ellible', async () => {
      await transferToStaking(acc1.address, '1')
      await transferToStaking(acc2.address, '0.5')

      expect(await rewardsContract.isEligble(acc1.address)).to.equal(true)
      expect(await rewardsContract.isEligble(acc2.address)).to.equal(true)
      expect(await rewardsContract.isEligble(acc3.address)).to.equal(false)

      await rewardsContract.connect(acc1).claim()
      expect(await rewardsContract.isEligble(acc1.address)).to.equal(false)
      expect(await rewardsContract.isEligble(acc2.address)).to.equal(true)

      await rewardsContract.connect(acc2).claim()
      expect(await rewardsContract.isEligble(acc1.address)).to.equal(false)
      expect(await rewardsContract.isEligble(acc2.address)).to.equal(false)

      const oneDay = 60 * 60 * 24
      await ethers.provider.send('evm_increaseTime', [oneDay])
      await ethers.provider.send('evm_mine', [])
      expect(await rewardsContract.isEligble(acc1.address)).to.equal(true)
      expect(await rewardsContract.isEligble(acc2.address)).to.equal(true)

      await Promise.all([
        rewardsContract.connect(acc1).claim(),
        rewardsContract.connect(acc2).claim(),
      ])

      await rewardsContract.setClaimInterval(oneDay * 7)
      expect(await rewardsContract.isEligble(acc1.address)).to.equal(false)
      expect(await rewardsContract.isEligble(acc2.address)).to.equal(false)

      await ethers.provider.send('evm_increaseTime', [oneDay])
      await ethers.provider.send('evm_mine', [])
      expect(await rewardsContract.isEligble(acc1.address)).to.equal(false)
      expect(await rewardsContract.isEligble(acc2.address)).to.equal(false)

      await ethers.provider.send('evm_increaseTime', [oneDay * 7])
      await ethers.provider.send('evm_mine', [])
      expect(await rewardsContract.isEligble(acc1.address)).to.equal(true)
      expect(await rewardsContract.isEligble(acc2.address)).to.equal(true)
    })

    it('claim method should be time based', async () => {
      await transferToStaking(acc1.address, '1')

      let previousBalance = await grapeToken.balanceOf(acc1.address)
      await rewardsContract.connect(acc1).claim()
      let updatedBalance = await grapeToken.balanceOf(acc1.address)
      expect(updatedBalance.gt(previousBalance)).to.equal(true)
      previousBalance = updatedBalance

      let errorMessage
      try {
        await rewardsContract.connect(acc1).claim()
      } catch (e: any) {
        errorMessage = e.message
      }
      expect(errorMessage).to.include('The time between claim is not enough')
      const oneDay = 60 * 60 * 24

      await ethers.provider.send('evm_increaseTime', [oneDay])
      await ethers.provider.send('evm_mine', [])

      // claim cant be called multiple times in a row
      await rewardsContract.connect(acc1).claim()
      updatedBalance = await grapeToken.balanceOf(acc1.address)
      expect(updatedBalance.gt(previousBalance)).to.equal(true)
      previousBalance = updatedBalance
    })
  })
})
