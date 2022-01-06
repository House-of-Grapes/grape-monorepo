// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

contract GrapeToken is ERC20, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256('PAUSER_ROLE');
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
    bytes32 public constant BURNER_ROLE = keccak256('BURNER_ROLE');

    uint256 public constant DENOMINATOR = 10000;
    uint256 public taxAmount = 330;
    uint256 public burnableTimestamp;
    address public taxAddress;

    constructor(address _taxAddress) ERC20('Grape', 'GRAPE') {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);

        taxAddress = _taxAddress;
        burnableTimestamp = block.timestamp + 180 days;
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function burn(address from, uint256 amount) public onlyRole(BURNER_ROLE) {
        require(
            burnableTimestamp <= block.timestamp,
            'Cant burn the token. Time is not ready yet.'
        );

        _burn(from, amount);
    }

    function mint(address to, uint256 amount)
        public
        whenNotPaused
        onlyRole(MINTER_ROLE)
    {
        _mint(to, amount);
        if (taxAddress != address(0)) {
            _mint(taxAddress, (amount * taxAmount) / DENOMINATOR);
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    function setTaxAddress(address _taxAddress)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        taxAddress = _taxAddress;
    }

    function setTaxAmount(uint256 _taxAmount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        taxAmount = _taxAmount;
    }

    function setBurnableTimestamp(uint256 _timestamp)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            _timestamp > block.timestamp,
            'New timestamp needs to be larger then current timestamp.'
        );
        burnableTimestamp = _timestamp;
    }

    function transferOwnership(address newOwner)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(newOwner != address(0), 'Address cant be empty');
        _grantRole(DEFAULT_ADMIN_ROLE, newOwner);
        _grantRole(PAUSER_ROLE, newOwner);
        _grantRole(MINTER_ROLE, newOwner);
        _grantRole(BURNER_ROLE, newOwner);

        renounceRole(DEFAULT_ADMIN_ROLE, msg.sender);
        renounceRole(PAUSER_ROLE, msg.sender);
        renounceRole(MINTER_ROLE, msg.sender);
        renounceRole(BURNER_ROLE, msg.sender);
    }
}
