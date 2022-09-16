import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectWallet } from "../../redux/blockchain/blockchainActions";
import { fetchData } from "./../../redux/data/dataActions";
import * as s from "./../../styles/globalStyles";
import masterHunter from "../masterHunter";
import starHunter from "../starHunter";
import hunter from "../hunter";
import Loader from "../../components/Loader/loader";
import PublicCountdown from "../../components/Countdown/publicCountdown";
import TeamCountdown from "../../components/Countdown/teamCountdown";
import MasterHunterCountdown from "../../components/Countdown/masterHunterCountdown";
import StarHunterCountdown from "../../components/Countdown/starHunterCountdown";
import HunterCountdown from "../../components/Countdown/hunterCountdown";
import Navbar from "../../components/Navbar/Navbar";
// Add this import line at the top
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3("https://eth-rinkeby.alchemyapi.io/v2/nZn20L-4EPgloJesoSx35hnTO8cK6c7o");
var Web3 = require('web3');
var Contract = require('web3-eth-contract');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

// Master Hunter MerkleTree
const leafNodes = masterHunter.map(addr => keccak256(addr));
const merkleTreeMaster = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
const rootHashMaster = merkleTreeMaster.getRoot();
console.log('Master Hunter Merkle Tree\n', merkleTreeMaster.toString());


// Star Hunter MerkleTree
const leafNodesEarly = starHunter.map(addr => keccak256(addr));
const merkleTreeEarly = new MerkleTree(leafNodesEarly, keccak256, { sortPairs: true });
const rootHashEarly = merkleTreeEarly.getRoot();
console.log('Star Hunter Merkle Tree\n', merkleTreeEarly.toString());

// Hunter  MerkleTree
const leafNodesHunter = hunter.map(addr => keccak256(addr));
const merkleTreeHunter = new MerkleTree(leafNodesHunter, keccak256, { sortPairs: true });
const rootHashHunter = merkleTreeHunter.getRoot();
console.log('Hunter Merkle Tree\n', merkleTreeHunter.toString());



function Home() {

  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [mintDone, setMintDone] = useState(false);
  const [supply, setTotalSupply] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [statusAlert, setStatusAlert] = useState("");
  const [mintAmount, setMintAmount] = useState(1);
  const [displayCost, setDisplayCost] = useState(0);
  const [state, setState] = useState(-1);
  const [nftCost, setNftCost] = useState(-1);
  const [canMintWL, setCanMintWL] = useState(false);
  const [canMintEA, setCanMintEA] = useState(false);
  const [disable, setDisable] = useState(false);
  const [max, setMax] = useState(0);
  const [loading, setLoading] = useState(true);
  const [proof, setProof] = useState([]);
  const [totalMint, setTotalMint] = useState(0);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = async () => {
    let cost = nftCost;
    cost = Web3.utils.toWei(String(cost), "ether");

    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}`);
    setClaimingNft(true);
    setLoading(true);

    blockchain.smartContract.methods
      .mint(mintAmount, proof)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
        setLoading(false);
      })
      .then((receipt) => {
        setLoading(false);
        setMintDone(true);
        setFeedback(`Congratulation, your mint is successful.`);
        setClaimingNft(false);
        blockchain.smartContract.methods
          .totalSupply()
          .call()
          .then((res) => {
            setTotalSupply(res);
          });
        dispatch(fetchData(blockchain.account));
        getData();
      });

  };


  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
    setDisplayCost(
      parseFloat(nftCost * newMintAmount).toFixed(3)
    );
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    newMintAmount > max
      ? (newMintAmount = max)
      : newMintAmount;
    setDisplayCost(
      parseFloat(nftCost * newMintAmount).toFixed(3)
    );
    setMintAmount(newMintAmount);
  };

  const maxNfts = () => {
    setMintAmount(max);

    setDisplayCost(
      parseFloat(nftCost * max).toFixed(3)
    );

  };

  const getData = async () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
      const totalSupply = await blockchain.smartContract.methods
        .totalSupply()
        .call();
      setTotalSupply(totalSupply);
      let currentState = await blockchain.smartContract.methods
        .currentState()
        .call();
      setState(currentState);

      //  no of nfts minted by user
      let nftMintedByUser = await blockchain.smartContract.methods
        .mintableAmountForUser(blockchain.account)
        .call();
      setMax(nftMintedByUser);
      console.log({ nftMintedByUser });

      // Nft states
      if (currentState == 1) {
        const walletAddress = "0xa78A8ff1fAbd680FFB4a810d5e8831AA71e18933";
        console.log(blockchain.account);
        if (blockchain.account != walletAddress) {

          setFeedback(`You're not 8OD Member`);
          setDisable(true);
        } else {
          if (nftMintedByUser > 0) {
            setFeedback(`Welcome, you can mint up to ${nftMintedByUser} NFTs per transaction`);
          } else {
            setFeedback(`You've Minted all the NFTs`);
            setDisable(true);
          }
        }
        // Master Hunter
      } else if (currentState == 2) {
        const claimingAddress = keccak256(blockchain.account);
        const hexProof = merkleTreeMaster.getHexProof(claimingAddress);
        setProof(hexProof);
        let mintMasterHunter = merkleTreeMaster.verify(hexProof, claimingAddress, rootHashMaster);
        let mintMHContractMethod = await blockchain.smartContract.methods
          .isMasterHunter(blockchain.account, hexProof)
          .call();
        if (mintMHContractMethod && mintMasterHunter) {
          setCanMintEA(mintMasterHunter);
          setFeedback(`Welcome Master Hunter Member, you can mint up to ${nftMintedByUser} NFTs`)
        } else {
          setFeedback(`Sorry, your wallet is not on the Master Hunter list`);
          setDisable(true);
        }
      }
      // Star Hunter
      else if (currentState == 3) {
        const claimingAddress = keccak256(blockchain.account);
        const hexProof = merkleTreeEarly.getHexProof(claimingAddress);
        setProof(hexProof);
        let mintStarHunter = merkleTreeEarly.verify(hexProof, claimingAddress, rootHashEarly);
        let mintSHContractMethod = await blockchain.smartContract.methods
          .isStarHunter(blockchain.account, hexProof)
          .call();
        if (mintSHContractMethod && mintStarHunter) {
          setCanMintEA(mintStarHunter);
          setFeedback(`Welcome Star Hunter Member, you can mint up to ${nftMintedByUser} NFTs`)
        } else {
          setFeedback(`Sorry, your wallet is not on the Star Hunter list`);
          setDisable(true);
        }
      }
      // Hunter
      else if (currentState == 4) {
        const claimingAddress = keccak256(blockchain.account);
        const hexProof = merkleTreeHunter.getHexProof(claimingAddress);
        setProof(hexProof);
        let mintHunter = merkleTreeHunter.verify(hexProof, claimingAddress, rootHashHunter);
        let mintHContractMethod = await blockchain.smartContract.methods
          .isHunter(blockchain.account, hexProof)
          .call();
        if (mintHContractMethod && mintHunter) {
          setCanMintEA(mintHunter);
          setFeedback(`Welcome Hunter Member, you can mint up to ${nftMintedByUser} NFTs`)
        } else {
          setFeedback(`Sorry, your wallet is not on the Hunter list`);
          setDisable(true);
        }
      }
      // Public
      else {
        setFeedback(`Welcome, you can mint up to ${nftMintedByUser} NFTs per transaction`)
      }
    }
  };

  const getDataWithAlchemy = async () => {
    const abiResponse = await fetch("/config/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });


    const abi = await abiResponse.json();
    var contract = new Contract(abi, '0x6C4F4442F1B22d94212848E0EB20BcD72D619695');
    contract.setProvider(web3.currentProvider);
    // Get Total Supply
    const totalSupply = await contract.methods
      .totalSupply()
      .call();
    setTotalSupply(totalSupply);

    // Get Contract State
    let currentState = await contract.methods
      .currentState()
      .call();
    setState(currentState);

    // Set Price and Max According to State

    if (currentState == 0) {
      setStatusAlert("MINT NOT LIVE YET!");
      setDisable(true);
      setDisplayCost(0.00);
      setMax(0);
    }
    else if (currentState == 1) {
      let teamCost = await contract.methods
        .costFreeMint()
        .call();
      setDisplayCost(web3.utils.fromWei(teamCost));
      setNftCost(web3.utils.fromWei(teamCost));
      setStatusAlert("8od Team + Galleries ");
      setFeedback("Are you 8OD Member?");

      let wlMax = await contract.methods
        .maxMintAmountTeam()
        .call();
      setMax(wlMax);
    }
    else if (currentState == 2) {
      let masterHunterCost = await contract.methods
        .costWL()
        .call();
      setDisplayCost(web3.utils.fromWei(masterHunterCost));
      setNftCost(web3.utils.fromWei(masterHunterCost));
      setStatusAlert("MASTER HUNTER IS NOW LIVE!");
      setFeedback("Are you MASTER HUNTER Member?");
      let wlMax = await contract.methods
        .maxMintAmountMasterHunter()
        .call();
      setMax(wlMax);
    }
    else if (currentState == 3) {
      setStatusAlert("STAR HUNTER IS NOW LIVE!");
      let starHunterCost = await contract.methods
        .costWL()
        .call();
      setDisplayCost(web3.utils.fromWei(starHunterCost));
      setNftCost(web3.utils.fromWei(starHunterCost));
      setFeedback("Are you STAR HUNTER Member?");
      let earlyMax = await contract.methods
        .maxMintAmountStarHunter()
        .call();
      setMax(earlyMax);
    }
    else if (currentState == 4) {
      setStatusAlert(" HUNTER IS NOW LIVE!");
      let hunterCost = await contract.methods
        .costWL()
        .call();
      setDisplayCost(web3.utils.fromWei(hunterCost));
      setNftCost(web3.utils.fromWei(hunterCost));
      setFeedback("Are you HUNTER Member?");
      let earlyMax = await contract.methods
        .maxMintAmountHunter()
        .call();
      setMax(earlyMax);
    }
    else {
      let puCost = await contract.methods
        .cost()
        .call();
      setDisplayCost(web3.utils.fromWei(puCost));
      setNftCost(web3.utils.fromWei(puCost));
      setStatusAlert("Public Mint is Live");
      let puMax = await contract.methods
        .maxMintAmountPublic()
        .call();
      setMax(puMax);
    }

  }

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
    getDataWithAlchemy();
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);


  // Countdown Timer Team
  let countDownTeam = new Date("Aug 31, 2022 00:00:00 GMT +5:00 ").getTime();
  let nowTeam  = new Date().getTime();
  let timeleftTeam  = countDownTeam  - nowTeam;
  const [daysTeam, setDaysTeam ] = useState();
  const [hoursTeam , setHourTeam ] = useState();
  const [minutesTeam , setMintTeam ] = useState();
  const [secondsTeam , setSecTeam ] = useState();
  useEffect(() => {
    const intervalPublic = setInterval(() => {
      setDaysTeam(Math.floor(timeleftTeam / (1000 * 60 * 60 * 24)));
      setHourTeam(
        Math.floor((timeleftTeam % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      );
      setMintTeam(Math.floor((timeleftTeam % (1000 * 60 * 60)) / (1000 * 60)));
      setSecTeam(Math.floor((timeleftTeam % (1000 * 60)) / 1000));
    }, 1000);
    return () => clearInterval(intervalPublic);
  }, [daysTeam, hoursTeam, minutesTeam, secondsTeam]);

    // Countdown Timer Master Hunter
    let countDownMH = new Date("Sep 01, 2022 00:00:00 GMT +5:00 ").getTime();
    let nowMH= new Date().getTime();
    let timeleftMH = countDownMH - nowMH;
    const [daysMH, setDaysMH] = useState();
    const [hoursMH, setHourMH] = useState();
    const [minutesMH, setMintMH] = useState();
    const [secondsMH, setSecMH] = useState();
    useEffect(() => {
      const intervalMH = setInterval(() => {
        setDaysMH(Math.floor(timeleftMH / (1000 * 60 * 60 * 24)));
        setHourMH(
          Math.floor((timeleftMH % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        );
        setMintMH(Math.floor((timeleftMH % (1000 * 60 * 60)) / (1000 * 60)));
        setSecMH(Math.floor((timeleftMH % (1000 * 60)) / 1000));
      }, 1000);
      return () => clearInterval(intervalMH);
    }, [daysMH, hoursMH, minutesMH, secondsMH]);


    // Countdown Timer Star Hunter
    let countDownSH = new Date("Sep 02, 2022 00:00:00 GMT +5:00 ").getTime();
    let nowSH= new Date().getTime();
    let timeleftSH = countDownSH - nowSH;
    const [daysSH, setDaysSH] = useState();
    const [hoursSH, setHourSH] = useState();
    const [minutesSH, setMintSH] = useState();
    const [secondsSH, setSecSH] = useState();
    useEffect(() => {
      const intervalSH = setInterval(() => {
        setDaysSH(Math.floor(timeleftSH / (1000 * 60 * 60 * 24)));
        setHourSH(
          Math.floor((timeleftSH % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        );
        setMintSH(Math.floor((timeleftSH % (1000 * 60 * 60)) / (1000 * 60)));
        setSecSH(Math.floor((timeleftSH % (1000 * 60)) / 1000));
      }, 1000);
      return () => clearInterval(intervalSH);
    }, [daysSH, hoursSH, minutesSH, secondsSH]);

   // Countdown Timer Hunter
   let countDownH = new Date("Sep 03, 2022 00:00:00 GMT +5:00 ").getTime();
   let nowH= new Date().getTime();
   let timeleftH = countDownH - nowH;
   const [daysH, setDaysH] = useState();
   const [hoursH, setHourH] = useState();
   const [minutesH, setMintH] = useState();
   const [secondsH, setSecH] = useState();
   useEffect(() => {
     const intervalH = setInterval(() => {
       setDaysH(Math.floor(timeleftH / (1000 * 60 * 60 * 24)));
       setHourH(
         Math.floor((timeleftH % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
       );
       setMintH(Math.floor((timeleftH % (1000 * 60 * 60)) / (1000 * 60)));
       setSecH(Math.floor((timeleftH % (1000 * 60)) / 1000));
     }, 1000);
     return () => clearInterval(intervalH);
   }, [daysH, hoursH, minutesH, secondsH]);

  // Countdown Timer Public
  let countDownPublic = new Date("Sep 13, 2022 00:00:00 GMT +5:00 ").getTime();
  let nowPublic = new Date().getTime();
  let timeleftPublic = countDownPublic - nowPublic;
  console.log(nowPublic);
  const [daysPublic, setDaysPublic] = useState();
  const [hoursPublic, setHourPublic] = useState();
  const [minutesPublic, setMintPublic] = useState();
  const [secondsPublic, setSecPublic] = useState();
  useEffect(() => {
    const intervalPublic = setInterval(() => {
      setDaysPublic(Math.floor(timeleftPublic / (1000 * 60 * 60 * 24)));
      setHourPublic(
        Math.floor((timeleftPublic % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      );
      setMintPublic(Math.floor((timeleftPublic % (1000 * 60 * 60)) / (1000 * 60)));
      setSecPublic(Math.floor((timeleftPublic % (1000 * 60)) / 1000));
    }, 1000);
    return () => clearInterval(intervalPublic);
  }, [daysPublic, hoursPublic, minutesPublic, secondsPublic]);

  return (
    <>

      {loading && <Loader />}
      <s.Image src={"config/images/logo.png"} wid={"15"} style={{
        "marginTop": "25px"
      }} />
      <s.FlexContainer jc={"center"} ai={"center"} fd={"row"}
      >
              <s.Table>
          <table className="table">
            <thead>
              <tr>
                <th scope="col" className="text-white">Group</th>
                <th scope="col" className="text-white">Status</th>
                <th scope="col" className="text-white">Mint Start</th>
              </tr>
            </thead>
            <tbody className="table-group-divider">
              <tr>
                <td className="text-white">80D Team + Partners</td>
                <td><s.Status color={state == 1 ? "#25EF09" : "#F70505"} /></td>
                <td className="text-white text-center">
                {state != 0 && daysTeam > -1 && hoursTeam > -1 && minutesTeam > -1 && secondsTeam > -1 ? (
                    <TeamCountdown />
                  ): "---"}
                  
                </td>
              </tr>
              <tr>
                <td className="text-white">Master Hunter</td>
                <td><s.Status color={state == 2 ? "#25EF09" : "#F70505"} /></td>
                <td className="text-white  text-center">
                {state != 0 && daysTeam > -1 && hoursTeam > -1 && minutesTeam > -1 && secondsTeam > -1 ? (
                    <MasterHunterCountdown />
                  ): "---"}
                </td>
              </tr>
              <tr>
                <td className="text-white">Star Hunter</td>
                <td><s.Status color={state == 3 ? "#25EF09" : "#F70505"} /></td>
                <td className="text-white  text-center">
                {state != 0 && daysTeam > -1 && hoursTeam > -1 && minutesTeam > -1 && secondsTeam > -1 ? (
                    <StarHunterCountdown />
                  ): "---"}
                </td>
              </tr>
              <tr>
                <td className="text-white">Hunter</td>
                <td><s.Status color={state == 4 ? "#25EF09" : "#F70505"} /></td>
                <td className="text-white  text-center">
                {state != 0 && daysTeam > -1 && hoursTeam > -1 && minutesTeam > -1 && secondsTeam > -1 ? (
                    <HunterCountdown />
                  ): "---"}
                </td>
              </tr>
              <tr>
                <td className="text-white">Public Sale</td>
                <td><s.Status color={state == 5 ? "#25EF09" : "#F70505"} /></td>
                <td className="text-white  text-center">
                  {state != 0 && daysPublic > -1 && hoursPublic  > -1 && minutesPublic  > -1 && secondsPublic  > -1 ? (
                    <PublicCountdown />
                  ): "---"}
                </td>
              </tr>
            </tbody>
          </table>
        </s.Table>

        <s.Mint>
          <s.TextTitle
            size={3.0}
            style={{
              letterSpacing: "3px",

            }}
          >
            {/* {statusAlert} */}
          </s.TextTitle>
          <s.SpacerSmall />
          <s.SpacerLarge />
          <s.FlexContainer fd={"row"} ai={"center"} jc={"space-between"}>
            <s.TextTitle>Available</s.TextTitle>
            <s.TextTitle color={"var(--primary)"}>
              {CONFIG.MAX_SUPPLY - supply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
          </s.FlexContainer>
          <s.SpacerSmall />
          <s.Line />
          <s.SpacerSmall />
          <s.FlexContainer fd={"row"} ai={"center"} jc={"space-between"}>

            <s.TextTitle>Amount</s.TextTitle>

            <s.AmountContainer ai={"center"} jc={"center"} fd={"row"}>
              <s.StyledRoundButton
                style={{ lineHeight: 0.4 }}
                disabled={claimingNft ? 1 : 0}
                onClick={(e) => {
                  e.preventDefault();
                  decrementMintAmount();
                }}
              >
                -
              </s.StyledRoundButton>
              <s.SpacerMedium />
              <s.TextDescription color={"var(--primary)"} size={"2.5rem"}>
                {mintAmount}
              </s.TextDescription>
              <s.SpacerMedium />
              <s.StyledRoundButton
                disabled={claimingNft ? 1 : 0}
                onClick={(e) => {
                  e.preventDefault();
                  incrementMintAmount();
                }}
              >
                +
              </s.StyledRoundButton>
            </s.AmountContainer>

            <s.maxButton
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.preventDefault();
                maxNfts();
              }}
            >
              MAX
            </s.maxButton>
          </s.FlexContainer>

          <s.SpacerSmall />
          <s.Line />
          <s.SpacerSmall />
          <s.FlexContainer fd={"row"} ai={"center"} jc={"space-between"}>
            <s.TextTitle>Total Price</s.TextTitle>
            <s.TextTitle color={"var(--primary)"}>{displayCost}</s.TextTitle>
          </s.FlexContainer>
          <s.SpacerSmall />
          <s.Line />

          <s.SpacerLarge />
          {blockchain.account !== "" &&
            blockchain.smartContract !== null &&
            blockchain.errorMsg === "" ? (
            <s.Container ai={"center"} jc={"center"} fd={"row"}>
              <s.connectButton
                disabled={disable}
                onClick={(e) => {
                  e.preventDefault();
                  claimNFTs();
                }}
              >

                {claimingNft ? "Confirm Transaction in Wallet" : "Mint"}
                {/* {mintDone && !claimingNft  ? feedback : ""} */}
              </s.connectButton>{" "}
            </s.Container>
          ) : (
            <>
              {/* {blockchain.errorMsg === "" ? ( */}
              <s.connectButton
                style={{
                  textAlign: "center",
                  color: "#fff",
                  cursor: "pointer",
                }}
                disabled={state == 0 ? 1 : 0}
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(connectWallet());
                  getData();
                }}
              >
                Connect Wallet
              </s.connectButton>
              {/* ) : ("")} */}
            </>
          )}
          <s.SpacerLarge />
          <s.SpacerLarge />
          {blockchain.errorMsg !== "" ? (
            <s.connectButton
              style={{
                textAlign: "center",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {blockchain.errorMsg}
            </s.connectButton>
          ) : (
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {feedback}
            </s.TextDescription>
          )}
        </s.Mint>
        <s.Table></s.Table>

      </s.FlexContainer>
    </>
  );
}

export default Home;
