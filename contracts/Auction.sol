// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Auction {
    
    uint public auctionEndTime; 
    address payable public owner;
    address public highestBidder;
    uint public highestBid;
    mapping (address => uint) refund;
    bool ended;


    event NewOffer(uint amount, address bidder);
    event endedAuction(uint amountSpent, address highestBidder);

    constructor(uint biddingtime) payable {

        auctionEndTime = block.timestamp + biddingtime;
        owner = payable(msg.sender); // l'indirizzo del creatore dell'asta
        ended = false;

    }

    //funzione per fare un offerta
    function bid() public payable endAuction("The Auction is end.", false){

        require(msg.value > highestBid, "Another bid is higher than yours.");

        // mappa che immagazzina indirizzi e soldi da rimborsare
        // ad offerenti che hanno perso durante l'asta
        if(highestBid != 0){
            refund[highestBidder] += highestBid; 
        }

        highestBid = msg.value;
        highestBidder = msg.sender;

    }

    // funzione per ritirare il rimborso chiamabile da tutti gli offerenti
    function withdraw() public endAuction("You must wait until the end of the auction to be refund.",true){
        //Check-effects-interaction pattern
        uint amount = refund[msg.sender];  
        //checks
        require(amount>0,"You must have an amount greater than 0 to be refund");
        //effects
        refund[msg.sender] = 0;
        //interaction
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success,"Transfer failed");
    }

    modifier onlyOwner (string memory s) {
        require(msg.sender == owner,s);
        _; // poi fai quello che c'è sotto la funzione
    } 

    modifier endAuction (string memory s, bool _ended) {
        require(ended == _ended,s);
        _;
    }
    

    function auctionEnd() public onlyOwner("The Auction has to be ended by the owner.") endAuction("AuctionEnd has already been called",false){
        require(block.timestamp >= auctionEndTime, "The Auction is still open");
        ended = true;

        // scrivo nella blockchain il miglior offerente e la cifra da lui offerta
        // sta ad indicare la fine dell'asta
        emit endedAuction(highestBid,highestBidder);

        owner.transfer(highestBid);
    }
}

