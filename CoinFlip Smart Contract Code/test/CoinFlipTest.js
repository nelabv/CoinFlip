const CoinFlip = artifacts.require("CoinFlip");
const truffleAssert = require("truffle-assertions");

contract("CoinFlip", async function(accounts){
  let instance;

  before(async function(){
    instance = await CoinFlip.deployed()
  });

  it("Should not accept an invalid bet number; bet number should only be 1 OR 0", async function(){
    await truffleAssert.fails(instance.bet(3, {from: accounts[4], value: web3.utils.toWei("1", "ether")}),truffleAssert.ErrorType.REVERT);
  })

})
