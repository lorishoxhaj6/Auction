import { parseEther } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Auction Contract", function () {
  let auction: any;
  let owner: any, bidder1: any, bidder2: any;

  beforeEach(async function () {
    // Ottieni i firmatari (owner e bidder)
    [owner, bidder1, bidder2] = await ethers.getSigners();

    // Distribuisci il contratto
    const Auction = await ethers.getContractFactory("Auction");
    auction = await Auction.deploy(300); // Asta di durata 300 secondi
  });

  it("Should initialize auction correctly", async function () {
    const endTime = await auction.auctionEndTime();
    const auctionOwner = await auction.owner();
    const isEnded = await auction.getEnded();

    expect(endTime).to.be.greaterThan(0);
    expect(auctionOwner).to.equal(owner.address);
    expect(isEnded).to.be.false;
  });

  it("Should accept a valid bid", async function () {
    await auction.connect(bidder1).bid({ value: parseEther("1") });

    const highestBid = await auction.highestBid();
    const highestBidder = await auction.highestBidder();

    expect(highestBid).to.equal(parseEther("1"));
    expect(highestBidder).to.equal(bidder1.address);
  });

  it("Should reject lower bids", async function () {
    await auction.connect(bidder1).bid({ value: parseEther("2") });

    await expect(
      auction.connect(bidder2).bid({ value: parseEther("1") })
    ).to.be.revertedWith("Another bid is higher than yours.");
  });

  it("Should allow refunds after higher bid", async function () {
    await auction.connect(bidder1).bid({ value: parseEther("1") });
    await auction.connect(bidder2).bid({ value: parseEther("2") });

    const refundAmount = await auction.getRefund(bidder1.address);
    expect(refundAmount).to.equal(parseEther("1"));
  });

  it("Should handle withdrawal correctly", async function () {
    await auction.connect(bidder1).bid({ value: parseEther("1") });
    await auction.connect(bidder2).bid({ value: parseEther("2") });

    // Simula la fine dell'asta
    await ethers.provider.send("evm_increaseTime", [301]);
    await ethers.provider.send("evm_mine");
    await auction.connect(owner).auctionEnd();

    await auction.connect(bidder1).withdraw();
    const refundAmount = await auction.getRefund(bidder1.address);

    expect(refundAmount).to.equal(0); // Il rimborso deve essere zero dopo il ritiro
  });

  it("Should end auction correctly", async function () {
    await auction.connect(bidder1).bid({ value: parseEther("1") });

    await ethers.provider.send("evm_increaseTime", [301]);
    await ethers.provider.send("evm_mine");
    await auction.connect(owner).auctionEnd();

    const isEnded = await auction.getEnded();
    expect(isEnded).to.be.true;

    const highestBidder = await auction.highestBidder();
    expect(highestBidder).to.equal(bidder1.address);
  });

  it("Should reject bids after auction ends", async function () {
    await auction.connect(bidder1).bid({ value: parseEther("2") });

    await ethers.provider.send("evm_increaseTime", [301]);
    await ethers.provider.send("evm_mine");
    await auction.connect(owner).auctionEnd();

    await expect(
      auction.connect(bidder2).bid({ value: parseEther("3") })
    ).to.be.revertedWith("The Auction is end.");
  });

  it("Should only allow owner to end auction", async function () {
    await ethers.provider.send("evm_increaseTime", [301]);
    await ethers.provider.send("evm_mine");

    await expect(auction.connect(owner).auctionEnd()).to.not.be.reverted;

    await expect(
      auction.connect(bidder1).auctionEnd()
    ).to.be.revertedWith("The Auction has to be ended by the owner.");
  });
});
