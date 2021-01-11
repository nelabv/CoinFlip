import "./provableAPI.sol";

pragma solidity 0.5.12;

contract CoinFlip is usingProvable{
    address public owner;

    uint public contractBalance;

    uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;
    uint public latestNumber;

    constructor() public payable {
        require(msg.value == 1 ether, "Contract deployment needs 1 ether to fund the game initially.");

        owner = msg.sender;
        contractBalance = msg.value;
    }

    struct results{
        address payable playerAddress;
        uint betValue;
        uint side;

        uint randomNumber;
        bool winOrLose;
    }

    mapping (bytes32 => results) public _results;

    //Events ---------
    event LogNewProvableQuery(string description);
    event generatedRandomNumber(uint256 randomNumber);

    event mappingUpdated(string description);
    event playerInfoAdded(string description);

    event win(string description);
    event lose(string description);

    //Game proper ---------

    function bet(uint _coinSide) public payable {
        require(msg.value * 3 < contractBalance, "Place a bet that the game can double its value!");
        require(_coinSide == 1 || _coinSide == 0, "Coin side should only be 1 (heads) or 0 (tails) only.");

        contractBalance += msg.value;

        uint256 QUERY_EXECUTION_DELAY = 0;
        uint256 GAS_FOR_CALLBACK = 200000;

        bytes32 queryId = provable_newRandomDSQuery(
            QUERY_EXECUTION_DELAY,
            NUM_RANDOM_BYTES_REQUESTED,
            GAS_FOR_CALLBACK
            );

            emit LogNewProvableQuery("Provable query was sent, standing by for the answer.");

        _results[queryId].playerAddress = msg.sender;
        _results[queryId].betValue = msg.value;
        _results[queryId].side = _coinSide;

            emit mappingUpdated("Mapping updated. Waiting for random number.");
    }

    function __callback(bytes32 _queryId, string memory _result) public {
        require(msg.sender == provable_cbAddress(), "Callback error.");

        uint256 randomNumber = uint256(keccak256(abi.encodePacked(_result))) % 2;
        latestNumber = randomNumber;

        emit generatedRandomNumber(randomNumber);

        processResults(_queryId, latestNumber);
    }

    function processResults(bytes32 id, uint number) private {
        _results[id].randomNumber = number;

        //player wins double of his betting amount

        if (_results[id].randomNumber == 1){
            _results[id].winOrLose == true;
                uint prize =  _results[id].betValue * 3;
                _results[id].betValue = 0;
                _results[id].playerAddress.transfer(prize);

                emit win("You won!");
        }
        if (_results[id].randomNumber == 0){
            _results[id].winOrLose == false;

                contractBalance += _results[id].betValue;

                emit lose("You lost.");
        }
    }

    function withdrawBal() public {
        require(msg.sender == owner);
        uint balance = contractBalance;
        contractBalance = 0;
        msg.sender.transfer(balance);
    }

    function viewContractBalance() public view returns(uint) {
        return address(this).balance;
    }

    function showOwner() public view returns(address) {
        return owner;
    }

    function donate() public payable {
       require(msg.value > 0 wei, "Please enter a valid amount.");
       contractBalance += msg.value;
   }

}
