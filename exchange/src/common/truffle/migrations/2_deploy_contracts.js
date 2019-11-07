// const ConvertLib = artifacts.require("ConvertLib");


// module.exports = function(deployer) {
//   deployer.deploy(ConvertLib);
//   deployer.link(ConvertLib, MetaCoin);
//   deployer.deploy(MetaCoin);
// };

// var ExchangeToken = artifacts.require("ExchangeToken");
// var HelloWorld = artifacts.require("./HelloWorld.sol");
var DemoTypes = artifacts.require("DemoTypes");

module.exports = function(deployer) {
   deployer.deploy(DemoTypes);
  // deployer.deploy(HelloWorld);
  // deployer.deploy(ExchangeToken,"0x2a6f0e7ce6cb445cb8d1928274792dab9f28107c",10000);

};