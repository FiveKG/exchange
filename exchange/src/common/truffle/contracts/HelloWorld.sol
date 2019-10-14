pragma solidity >=0.4.21 <0.6.0;

contract HelloWorld {

  //say hello world
  function say() public pure returns (string memory ) {
    return "Hello World!";
  }

  //print name
  function print(string memory  name) public pure returns (string memory ) {
    return name;
  }

  function multiply(uint a) public pure returns(uint d) {
        return a * 7;
    }
}