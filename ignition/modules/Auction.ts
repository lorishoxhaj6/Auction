
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const biddingTime = 5*60;

export default buildModule("DeployAuction", (m) => {

    const auction = m.contract("Auction",[biddingTime]);

    const auctionManager = m.contract("AuctionManager",[]);

    m.call(auctionManager, "AddAuction", [auction]);

    return { auction, auctionManager };

});
