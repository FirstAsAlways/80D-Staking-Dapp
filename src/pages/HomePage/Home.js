import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectWallet } from "../../redux/blockchain/blockchainActions";
import { fetchData } from "./../../redux/data/dataActions";
import * as s from "./../../styles/globalStyles";
import Loader from "../../components/Loader/loader";
import PublicCountdown from "../../components/Countdown/publicCountdown";
import EmailModal from "../../components/Modal/modal";
// Importing toastify module
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

var stakedNFTs = {};

function Stake() {


  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);

  const [totalStaked, setTotalStaked] = useState(0);
  const [totalMinted, setTotalMinted] = useState(0);
  const [supply, setTotalSupply] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reveal, setReveal] = useState(true);
  const [date, setDate] = useState("");
  const [stakedObj, setStakedObj] = useState([]);
  const [userNFTToken, setuserNFTToken] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPopUpModal, setShowPopUpModal] = useState(false);
  const [claimCost , setCost] = useState(0);
  const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
  var Web3 = require('web3');
  const web3 = createAlchemyWeb3("https://eth-rinkeby.alchemyapi.io/v2/nZn20L-4EPgloJesoSx35hnTO8cK6c7o");

  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS_STAKE: "",
    ONTRACT_ADDRESS_NFT: "",
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

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);

    let date = new Date();
    setDate(date);
  };



  const getUserMintedNFT = async (tsupply, account) => {
    setLoading(true);
    const tokenIds = [];

    for (let i = 0; i < tsupply; i++) {
      const address = await blockchain.smartContractNFT.methods
        .ownerOf(i)
        .call();
      if (address === account) {
        tokenIds.push(i);
      }
    }
    return tokenIds;
  }

  const getUserStakedNFT = async (tokenIds) => {

    const stakedObjArr = [];
    for (let i = 0; i <= tokenIds.length; i++) {
      const stakedObj = {};
      const stake = await blockchain.smartContractStake.methods
        .vault(i)
        .call();

      if (stake[2] == blockchain.account) {
        stakedObj.TOKEN_ID = stake[0];
        stakedObj.TIMESTAMP = stake[1];
        stakedObj.ADDRESS = stake[2];
        stakedObjArr.push(stakedObj);
      }
    }
    return stakedObjArr;
  }

  const getData = async () => {
    if (blockchain.account !== "" && blockchain.smartContractStake !== null) {
      dispatch(fetchData(blockchain.account));

      // Total Overall NFTs Minted
      const totalSupply = await blockchain.smartContractNFT.methods
        .totalSupply()
        .call();
      setTotalSupply(totalSupply);

      // Total Staked 
      const totalStaked = await blockchain.smartContractStake.methods
        .totalStaked()
        .call();
      setTotalStaked(totalStaked);

      // Total Minted
      const totalMinted = await blockchain.smartContractNFT.methods
        .balanceOf(blockchain.account)
        .call();
      setTotalMinted(totalMinted);

      // Revealed or Not
      const reveal = await blockchain.smartContractNFT.methods
        .revealed()
        .call();
      setReveal(reveal);

      const cost = await blockchain.smartContractStake.methods
      .claimCost()
      .call();
      setCost(web3.utils.fromWei(cost));

      // Get User Minted NFT

      const tokens = await getUserMintedNFT(totalSupply, blockchain.account);
      if (tokens) {
        setuserNFTToken(tokens);
        const stakedNft = await getUserStakedNFT(tokens);
        if (stakedNft) {
          setStakedObj(stakedNft);
          setLoading(false);
        }
      }

    }
  };

  const stakeNFT = async (tokenId) => {
    setLoading(true);
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalGasLimit = String(gasLimit * 1);
    blockchain.smartContractStake.methods
      .stake([tokenId])
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS_STAKE,
        from: blockchain.account
      })
      .once("error", (err) => {
        console.log(err);
        setLoading(false);
      })
      .then(() => {
        blockchain.smartContractStake.methods
          .totalStaked()
          .call()
          .then((res) => {
            setTotalStaked(res);
          });
        dispatch(fetchData(blockchain.account));
        getData();
        setLoading(false);
      });
  }

  const unstakeNFT = async (tokenId) => {
    alert('When you claim your physical art piece, your NFT will be burned(destroyed).');
    setLoading(true);
    let cost = claimCost;
    cost = Web3.utils.toWei(String(cost), "ether");
    console.log({cost});
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * 1);
    let totalGasLimit = String(gasLimit * 1);
    blockchain.smartContractStake.methods
    .payAndclaim([tokenId])
    .send({
      gasLimit: String(totalGasLimit),
      to: CONFIG.CONTRACT_ADDRESS_STAKE,
      from: blockchain.account,
      value: totalCostWei,
    })
    .once("error", (err) => {
      console.log(err);
      setLoading(false);
    })
    .then(() => {
      blockchain.smartContractStake.methods
        .totalStaked()
        .call()
        .then((res) => {
          setTotalStaked(res);
        });
      dispatch(fetchData(blockchain.account));
      getData();
      $('#emailmodal').modal('show');
      setLoading(false);
    });

 




  }


  useEffect(() => {
    getConfig();
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account, showModal]);



  return (
    <>
      {loading && <Loader />}
      <s.Image src={"config/images/logo.png"} wid={"15"} style={{
        "marginTop": "25px"
      }} />
      <s.SpacerLarge /><s.SpacerLarge />
      <div className="container" style={{ width: "15%" }}>
        {blockchain.account !== "" &&
          blockchain.smartContractStake !== null &&
          blockchain.errorMsg === "" ? (
          <s.Container ai={"center"} jc={"center"} fd={"row"}>
            <div className="btn btn-claim btn-lg">

              {truncate(blockchain.account, 15)}
            </div>

          </s.Container>
        ) : (
          ""
        )}
      </div>
      <s.SpacerLarge />
      {/* Header */}
      <div className="container">
        <div className="row ">
          <div className="col-md-4">
            <div className="card  mx-sm-1 p-3">
              <div className=" text-white p-3 m-auto " >
                <span className="fa fa-info-circle" aria-hidden="true"></span>
              </div>
              <div className="text-white text-center mt-3"><h4>Total NFT's</h4></div>
              <div className="text-white text-center mt-2"><h1>{totalMinted}</h1></div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-white mx-sm-1 p-3">
              <div className=" text-white p-3 m-auto " >
                <span className="fa fa-hourglass" aria-hidden="true"></span>
              </div>
              <div className="text-white text-center mt-3"><h4>Total Claimed</h4></div>
              <div className="text-white text-center mt-2"><h1>0</h1></div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-white mx-sm-1 p-3">
              <div className=" text-white p-3 m-auto " >
                <span className="fa fa-window-restore" aria-hidden="true"></span>
              </div>
              <div className="text-white text-center mt-3"><h4>Total Staked</h4></div>
              <div className="text-white text-center mt-2"><h1>{totalStaked}</h1></div>
            </div>
          </div>
        </div>
      </div>

      <s.SpacerLarge />

      {/* NFT's Section */}

      {/* Staked NFTs Section */}
      {blockchain.account !== "" &&
        blockchain.smartContractStake !== null &&
        blockchain.errorMsg === "" ? (
        <>
          <div className="jumbotron container" style={{
            background: "#01014D !important"
          }}>


            <h2 className="title">My NFTs (Staked)</h2>
            <s.SpacerLarge />
            <div className="flex-container">

              {
                stakedObj.length > 0 ? (
                  userNFTToken.length > 0 ? (
                    stakedObj && stakedObj.map((nft, index) => {
                      let nftDate = new Date(parseInt(nft.TIMESTAMP) * 1000);
                      nftDate = nftDate.setDate(nftDate.getDate() + 49);
                      return (
                        <>

                          <div className="flex-item border" key={index}>
                            {reveal ? <s.Image  ></s.Image> :
                              <s.Image className="p-3" src={"https://gateway.pinata.cloud/ipfs/Qmbd75FH26ihxB8yRJVaV24w9sChkEUY7Nf3iVXugn9r99"}
                                wid={"80"}></s.Image>}
                            <div className="d-flex justify-content-around">
                              {nftDate > date ? (
                                <PublicCountdown date={nft.TIMESTAMP} />
                              ) : (
                                <button className="btn btn-claim"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setTimeout(() => {
                                      unstakeNFT(nft.TOKEN_ID);
                                      setLoading(false);
                                    }, 1000);
                                  }}
                                >Claim Free</button>
                              )}


                            </div>
                            <s.SpacerSmall />
                            <div className="d-flex justify-content-around">
                              <button className="btn btn-claim"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setTimeout(() => {
                                    unstakeNFT(nft.TOKEN_ID);
                                    setLoading(false);
                                  }, 1000);
                                }}
                              >Buy Now</button>
                            </div>

                            <s.SpacerLarge />
                          </div> </>)



                    })
                  ) : (
                    <div className="col-md-12">
                      <p className="text-white">You don't have Minted any NFTs</p>
                    </div>
                  )

                ) : (
                  <>
                    <div className="col-md-12">
                      <p className="text-white">You don't have Staked any NFTs</p>
                    </div>
                  </>
                )
              }

            </div>
          </div>
        </>
      ) : ("")}

      {/* UnStaked NFTs Section */}

      <div className="jumbotron container" style={{
        background: "#01014D !important"
      }}>
        {blockchain.account !== "" &&
          blockchain.smartContractStake !== null &&
          blockchain.errorMsg === "" ? (

          <>
            <h2 className="title">My NFTs (Unstaked)</h2>
            <s.SpacerLarge />
            <div className="flex-container">
              {
                userNFTToken.length > 0 ? (
                  userNFTToken.map((nft, index) => {
                    let newmap = stakedObj.map((el) => parseInt(el.TOKEN_ID));
                    return (
                      <>
                        {newmap.indexOf(nft) == -1 ? (
                          <div className="flex-item border" key={index}>
                            {reveal ? <s.Image  ></s.Image> :
                              <s.Image className="p-3" src={"https://gateway.pinata.cloud/ipfs/Qmbd75FH26ihxB8yRJVaV24w9sChkEUY7Nf3iVXugn9r99"}
                                wid={"80"}></s.Image>}

                            <div className="d-flex justify-content-center">
                              <button className="btn btn-stake"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setTimeout(() => {
                                    stakeNFT(nft);
                                  }, 1000);
                                }}
                              >Stake</button>
                            </div>
                            <s.SpacerSmall />
                            <s.SpacerLarge />
                          </div>
                        ) : ("")
                        }
                      </>
                    )
                  })
                ) : (
                  <div className="col-md-12">
                    <p className="text-white">You don't have any NFTs Minted For Stacking!!!</p>
                  </div>
                )
              }

            </div>

          </>
        ) : (
          <>
            <s.connectButton
              style={{
                textAlign: "center",
                color: "#01004D",
                cursor: "pointer",
                margin: "auto",
                display: "block",
                background: "#fff",
                border: "#17a2b8"
              }}
              onClick={(e) => {
                e.preventDefault();
                dispatch(connectWallet());
                setTimeout(() => {
                  getData();
                  setLoading(false);
                }, 2500);
              }}
              wid={"35%"}
            >
              Connect Wallet
            </s.connectButton>
          </>
        )}

      </div>

      {/* Modal COde */}

      <div className="modal fade" id="emailmodal" data-backdrop="static" data-keyboard="false" tabIndex="-1" aria-labelledby="emailmodal" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-center" id="staticBackdropLabel">Claim Your NFT</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <EmailModal />
            </div>

          </div>
        </div>
      </div>

      {/* Pop Up Modal Code */}

     
    </>
  );

}

export default Stake;