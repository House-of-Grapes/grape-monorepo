// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import '@openzeppelin/contracts/utils/math/Math.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import {MerkleProof} from '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol'; // OZ: MerkleProof

interface IERC20Mintable is IERC20 {
    function mint(address to, uint256 amount) external;
}

contract Rewards is Ownable, ReentrancyGuard, Pausable {
    IERC20Mintable public rewardsToken;
    IERC20 public stakingToken;

    using SafeERC20 for IERC20;

    error NotInMerkle();
    error AlreadyClaimed();

    uint256 public constant DENOMINATOR = 10000;

    // settings
    uint256 public claimInterval = 1 days;
    uint256 public claimAmount = 80 * 1e18;
    uint256 public claimBonusNumerator = 20;
    uint256 public claimBonusCeiling = 75 * 1e18;
    bytes32 public immutable merkleRoot;

    mapping(address => bool) public hasInitialClaimed;
    mapping(address => uint256) public lastClaimed;

    event InitialClaim(address indexed to, uint256 amount);

    event Harvest(
        address indexed account,
        uint256 indexed ammount,
        uint256 indexed timestamp
    );

    constructor(
        address _rewardsToken,
        address _stakingToken,
        bytes32 _merkleRoot
    ) {
        rewardsToken = IERC20Mintable(_rewardsToken);
        stakingToken = IERC20(_stakingToken);
        merkleRoot = _merkleRoot;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function initialClaim(
        address to,
        uint256 amount,
        bytes32[] calldata proof
    ) external {
        // Throw if address has already claimed tokens
        if (hasInitialClaimed[to]) revert AlreadyClaimed();

        // Verify merkle proof, or revert if not in tree
        bytes32 leaf = keccak256(abi.encodePacked(to, amount));
        bool isValidLeaf = MerkleProof.verify(proof, merkleRoot, leaf);
        if (!isValidLeaf) revert NotInMerkle();
        // Set address to claimed
        hasInitialClaimed[to] = true;

        // Mint tokens to address
        rewardsToken.mint(to, amount);

        // Emit claim event
        emit InitialClaim(to, amount);
    }

    function claim() external whenNotPaused nonReentrant {
        require(
            haveStaked(msg.sender),
            'Sender have not staked tokens and not eligble'
        );
        require(
            timeHavePassed(msg.sender),
            'The time between claim is not enough'
        );
        require(isEligble(msg.sender), 'Sender is not allible to claim');

        uint256 amount = _getAmount(msg.sender);
        rewardsToken.mint(msg.sender, amount);
        lastClaimed[msg.sender] = block.timestamp;
        emit Harvest(msg.sender, amount, block.timestamp);
    }

    function _getAmount(address account) internal view returns (uint256) {
        uint256 balance = stakingToken.balanceOf(account);

        if (balance >= 1e18) {
            uint256 maxBalance = balance;

            if (balance > claimBonusCeiling) {
                maxBalance = claimBonusCeiling;
            }

            uint256 extra = (
                ((maxBalance * claimBonusNumerator) / DENOMINATOR)
            ) + 1e18;

            return (extra * claimAmount) / 1e18;
        } else if (balance > 0) {
            return claimAmount;
        }

        return 0;
    }

    function getAmount(address account) public view returns (uint256) {
        return _getAmount(account);
    }

    function haveStaked(address account) internal view returns (bool) {
        uint256 balance = stakingToken.balanceOf(account);

        if (balance == 0) {
            return false;
        }

        return true;
    }

    function timeHavePassed(address account) internal view returns (bool) {
        if (block.timestamp - lastClaimed[account] < claimInterval) {
            return false;
        }

        return true;
    }

    function isEligble(address account) public view returns (bool) {
        if (!haveStaked(account)) {
            return false;
        }

        if (!timeHavePassed(account)) {
            return false;
        }

        return true;
    }

    // setters
    function setStakingToken(address _stakingToken) external onlyOwner {
        stakingToken = IERC20(_stakingToken);
    }

    function setRewardsToken(address _rewardsToken) external onlyOwner {
        rewardsToken = IERC20Mintable(_rewardsToken);
    }

    function setClaimInterval(uint256 _claimInterval) external onlyOwner {
        claimInterval = _claimInterval;
    }

    function setClaimAmount(uint256 _claimAmount) external onlyOwner {
        claimAmount = _claimAmount;
    }

    function setClaimBonusNumerator(uint256 _claimBonusNumerator)
        external
        onlyOwner
    {
        claimBonusNumerator = _claimBonusNumerator;
    }

    function setClaimBonusCeiling(uint256 _claimBonusCeiling)
        external
        onlyOwner
    {
        claimBonusCeiling = _claimBonusCeiling;
    }
}
