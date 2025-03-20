const { loadFixture } = require("@nomicfoundation/hardhat-networks-helpers");
const { expect } = require("chai");
import { ethers } from "hardhat"

describe("Auction Manager contract",function(){

  async function deployAuctionManager() {
    // oggetti che ci permettono di interargire con il contratto
    const AuctionManager = await ethers.getContractFactory("AuctionManager");
    const Auction = await ethers.getContractFactory("Auction");

    
    const auctionmanager = await AuctionManager.deploy();
    const auction = await Auction.deploy();
    
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    await auctionmanager.deployed();
    await auction.deployed();

    return {owner,addr1,addr2, auction, auctionmanager};
  }

  it("Should emit AuctionCreated event", async function () {

    const {auctionmanager, owner, auction} = await loadFixture(deployAuctionManager);
    
    expect(await auctionmanager.AddAuction(auction.address))
    .to.emit(auctionmanager,"AuctionCreated")
    .withArgs(auction,owner.address);

  })

})