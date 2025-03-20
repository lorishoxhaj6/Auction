// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "contracts/Auction.sol";

contract AuctionManager {
    Auction[] public auctions;

    event AuctionCreated(Auction auctionAdress, address owner);

    // Crea una nuova asta e la registra nel gestore
    function AddAuction(Auction newAuction) public {
        // collega l'asta ad un gestore
        auctions.push(newAuction);

        emit AuctionCreated(newAuction, msg.sender);
    }

    // Ottieni il numero di aste create
    function getAuctionCount() external view returns (uint) {
        return auctions.length;
    }
}
