import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";
import { ThreeDots } from  'react-loader-spinner'

// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = 'pluto_04';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x7f7141Fd06acF7C18dbccE1fAfA50527c86D27FC";


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [currentLeftMintNumber, setCurrentLeftMintNumber] = useState(50);
  const [tokenId, setTokenId] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const rinkebyChainId = "0x4";

  const getLimit = async () => {
    const {ethereum} = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            myEpicNft.abi,
            signer
        );
        /* コントラクトからgetAllWavesメソッドを呼び出す */
        const limit = await connectedContract.getLimit();
        /* UIに必要なのは、アドレス、タイムスタンプ、メッセージだけなので、以下のように設定 */
        setCurrentLeftMintNumber(limit);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkNetwork = async (ethereum) => {
    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);

    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
      return false
    }
    return true
  }

  const checkIfWalletConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
    } else {
      await checkNetwork(ethereum)


      const accounts = await ethereum.request({method: "eth_accounts"});
      await getLimit();

      if (accounts.length !== 0) {
        console.log("Found an authorized account");
        setCurrentAccount(accounts[0]);



        await setupEventListener();
      } else {
        console.log("No authorized account found");
      }
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      })
      console.log("Connected", accounts[0]);

      setCurrentAccount(accounts[0]);
      setupEventListener();
    }catch (error) {
      console.log(error);
    }
  }

  // setupEventListener 関数を定義します。
// MyEpicNFT.sol の中で event が　emit された時に、
// 情報を受け取ります。
  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        // NFT が発行されます。
        const connectedContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            myEpicNft.abi,
            signer
        );
        // Event がemit される際に、コントラクトから送信される情報を受け取っています。
        connectedContract.on("NewEpicNFTMinted", (from, tokenId, limit) => {
          console.log(from, tokenId.toNumber());
          setTokenId(tokenId);
          // alert(
          //     `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          // );
        });
        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            myEpicNft.abi,
            signer
        );
        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setIsMinting(true);
        console.log("Minting... please wait");

        await nftTxn.wait();
        console.log(
            `Mined, see transaction: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId}
`);
        await getLimit();
        setIsMinting(false);
      } else {
        setIsMinting(false);
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      setIsMinting(false);
      console.log(error);
    }
  }


  // renderNotConnectedContainer メソッドを定義します。
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const openOpenSea = () => {
    window.open("https://testnets.opensea.io/collection/squarenft-g7xsbdjwnt")
  }

  useEffect(() => {
    checkIfWalletConnected()
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>

          {currentAccount !== "" && (  <div>
            <p className="mint-count">残りのMintできる回数 👉 {currentLeftMintNumber.toString() }</p>
          </div>)}



          <p className="sub-text">
            あなただけの特別な NFT を Mint しよう💫
          </p>

          {currentAccount === "" ? (
              renderNotConnectedContainer()
          ) : (

              <button onClick={askContractToMintNft} className="cta-button connect-wallet-button" >
                Mint NFT
              </button>
          )}
        </div>
        {isMinting && (   <div className="load-spinner-container">
          <ThreeDots color="#00BFFF" height={80} width={80} />
        </div>)}


        <div className="footer-container">
          <button className="opensea-button" onClick={openOpenSea}>Check you NFT at Open Sea!</button>
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
