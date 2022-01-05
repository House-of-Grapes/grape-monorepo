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

interface IERC20Mintable is IERC20 {
    function mint(address to, uint256 amount) external;
}

contract Distributor is Ownable, ReentrancyGuard, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256('PAUSER_ROLE');
    bytes32 public constant RELEASER_ROLE = keccak256('RELEASER_ROLE');

    IERC20Mintable public rewardsToken;
    IERC20 public stakingToken;

    using SafeERC20 for IERC20;

    event Release(
        address indexed account,
        uint256 indexed ammount,
        uint256 indexed timestamp
    );

    constructor(address _rewardsToken, address _stakingToken) {
        rewardsToken = IERC20Mintable(_rewardsToken);
        stakingToken = IERC20(_stakingToken);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(RELEASER_ROLE, msg.sender);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function release(address[] memory accounts, uint256 amount)
        external
        onlyRole(RELEASER_ROLE)
        whenNotPaused
        nonReentrant
    {
        for (uint256 i = 0; i < accounts.length; i++) {
            if (haveStaked(accounts[i])) {
                rewardsToken.mint(accounts[i], amount);
                emit Release(accounts[i], amount, block.timestamp);
            }
        }
    }

    function haveStaked(address account) internal view returns (bool) {
        uint256 balance = stakingToken.balanceOf(account);

        if (balance == 0) {
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
}
