var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var playAddress;
var betCoinSide;
var etherAmountBet;

$(document).ready(function(){
    window.ethereum.enable().then(function(accounts){
      contractInstance = new web3.eth.Contract(abi, "0xFFd11F26Af443987A0C7D648ED473137e2BE440E", {from: accounts[0]});
      console.log(contractInstance);
      contractInstance.methods.showOwner().call().then(function(res){
        $("#owner-span").text(res);
      });
    });

      $("#contractBalance-button").click(getContractBalance);
      $("#bet_button").click(bet);
      $("#start-game-button").click(showHeadsOrTailsDiv);
      $("#next-btn").click(setBettingAmountDiv);
      $("#try-again").click(newGame);

      $("#donate-ether").click(donateToCoinFlip);
});

function getContractBalance(){
  contractInstance.methods.viewContractBalance().call().then(function(res){
    $("#contractValue").text(web3.utils.fromWei(res.toString(), "ether") + " Ether");
  })
}

function fetchFormValues(){
  betCoinSide = $('input[name=side]:checked', '#coinSide-form').val();
  etherAmountBet = $('input[name=bet]:checked', '#betAmount-form').val();
}

function bet(){
  var checkError = $('input:radio[name="bet"]:checked').length;
  //inset span
  if(checkError == 0){
    $("#bet-amount-error-form").text("Set your bet.");
  }

  if(checkError == 1){
    $("#heads-or-tails-div").hide();
    $("#preferred-betting-amount").hide();

    $("#generating-results").show();

    fetchFormValues();

    var config = {
      value: web3.utils.toWei(etherAmountBet, "ether")
    }

    contractInstance.methods.bet(betCoinSide).send(config)
        .on("transactionHash", function(hash){
          $("#tx-notif").text("Your transaction hash is: ");
          $("#tx-hash").text(hash);
          console.log(hash);
        })
        .on("confirmation", function(confirmationNr){
          console.log(confirmationNr);
        })
        .on("receipt", function(receipt){
          console.log(receipt);
        })

        contractInstance.once("win", function(err, res){
          console.log(res);
          $("#generating-results").hide();
          $("#result-div").show();
          $("#result-span").text("You won " + etherAmountBet * 2 + " ether!");
        })

        contractInstance.once("lose", function(err, res){
          console.log(res);
          $("#generating-results").hide();
          $("#result-div").show();
          $("#result-span").text("You lost " + etherAmountBet + " ether. Better luck next time!");
        })
  }
}

function showHeadsOrTailsDiv(){
  $("#donate-to-the-game").hide();
  $("#heads-or-tails-div").show();
  $("#mechanics-div").hide();
  $("#withdraw").hide();
}

function setBettingAmountDiv(){
  var checkError = $('input:radio[name="side"]:checked').length;

  if (checkError == 0){
    $("#error-form").text("Please select a coinside.");
  } else if (checkError == 1) {
    $("#preferred-betting-amount").show();
    $("#error-form").hide();
  }
}

function newGame(){
  $("#result-div").hide();
  $("#mechanics-div").show();
  $("#donate-to-the-game").show();
}

function donateToCoinFlip(){
  var amount = $('input[type=number][name=donation]').val();
  console.log("To donate: " + amount + " ether.");

  contractInstance.methods.donate().send({
      value: web3.utils.toWei(amount, "ether")
    })

    .on("transactionHash", function(hash){
      $("#tx-donate-hash").text("Transaction hash: " + hash);
      console.log(hash);
    })
}
