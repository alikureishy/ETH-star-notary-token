import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  setQueryResult: function(message) {
    const queryResult = document.getElementById("queryResult");
    queryResult.innerHTML = message;
  },

  createStar: async function () {
    let self = this;
    const { createStar } = this.meta.methods;
    const name = document.getElementById("starName").value;
    const dec = document.getElementById("starDec").value;
    const mag = document.getElementById("starMag").value;
    const ent = document.getElementById("starEnt").value;
    const story = document.getElementById("starStory").value;
    const id = document.getElementById("starId").value;
    await createStar(name, dec, mag, ent, story, id).send({ from: self.account }, function (error, result) {
      if (!error) {
        // console.log("Result: ", result, typeof (result));
        App.setStatus("Account: " + self.account + " has just purchased star with token id: " + id);
      } else {
        alert(error)
      }
    });
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function () {
    let self = this;
    const { lookUptokenIdToStarInfo } = this.meta.methods;
    const starId = document.getElementById("queryId").value;
    await lookUptokenIdToStarInfo(starId).call({ from: self.account }, null, function(error, result) {
      if (!error) {
        // console.log("Result: ", result, typeof (result));
        const name = result[0];
        const dec = result[1];
        const mag = result[2];
        const ent = result[3];
        const story = result[4];
        App.setQueryResult("[" + name + " / " + dec + " / " + mag + " / " + ent + " / " + story + "]");
      } else {
        alert(error)
      }
    })
  }

};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    alert ("No web3 detected");
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
  }

  App.start();
});