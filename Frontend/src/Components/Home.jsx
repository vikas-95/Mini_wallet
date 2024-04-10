import React, { useContext, useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import QRCode from "react-qr-code";
import axios from "axios";
import "./App.css";
import "./Home.css";
import Signup from "./Signup";
import { parseEther } from "ethers/lib/utils";
import { useId } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import copy from "copy-to-clipboard";
import { FaCopy } from "react-icons/fa6";
import toast, { Toaster } from "react-hot-toast";
import { CSSProperties } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { Link } from "react-router-dom";
import { UserdetailsContext } from "./Login";

const Home = () => {
  const location = useLocation();
  const passwordHintId = useId();
  const [copyText, setCopyText] = useState("");
  const [newAccountAddress, setNewAccountAddress] = useState("");
  let [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txDetails, setTxDetails] = useState(0);
  const [accountNo, setAccountNo] = useState(null);
  // const [PvtKey, setPvtKey] = useState(null);
  // const [txDetailsShow, setTxDetailsShow] = useState();
  const ownerAddress = "0x95E109B4cf8ebd998a8965e5F5AF25fE4797E001";

  const address = location.state ? location.state.address : null;
  const pvtKey = location.state ? location.state.privatekey : null;
  const userId = location.state ? location.state.userId : null;
  const [transactions_0, setTransactions_0] = useState([]);
  const [successfull, setSuccessfull] = useState(true);
  const [userid, setNewUserId] = useState(null);
  let transactionResponse;
  let balanceOfAccount;

  const navigate = useNavigate();

  const txDetailsClose = () => {
    setTxDetails(1);
  };

  const timeOutBalance = () => {
    // let [msg,setnewMsg] = useState(balance);
    setBalance(null);
  };

  const handleTransaction = async () => {
    try {
      await fetch(
        `https://api-testnet.polygonscan.com/api?module=account&action=txlist&address=${newAccountAddress}&startblock=0&endblock=99999999&page=1&offset=100&sort=asc&apikey=7GCP93CMEB3UPK1MYXNJQNR49J3DZFU653`
      )
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.result.length === 0) {
            setTransactions(["There are no transactions"]);
          } else {
            const date = (x) => {
              let d = new Date(x * 1000);
              let date = d.getDate();
              let month = d.getMonth() + 1;
              let year = d.getFullYear();
              let hours = d.getHours();
              let minutes = d.getMinutes();
              let ampm = hours >= 12 ? "PM" : "AM";
              hours = hours % 12;
              hours = hours ? hours : 12; // the hour '0' should be '12'
              minutes = minutes < 10 ? "0" + minutes : minutes;
              let strTime = `${date}/${month}/${year} (${hours}:${minutes} ${ampm})`;
              return strTime;
            };

            const transactions = data.result.map((tx) => (
              <tr key={tx.hash} style={{ padding: "10px" }}>
                <td>{`${tx.hash.slice(0, 7)}........${tx.hash.slice(-5)}`}</td>
                <td>{`${tx.from.slice(0, 4)}...${tx.from.slice(-3)}`}</td>
                <td>{`${tx.to.slice(0, 4)}...${tx.to.slice(-3)}`}</td>
                <td>{ethers.utils.formatUnits(tx.value, "ether")} MATIC</td>
                <td>{date(tx.timeStamp)}</td>
              </tr>
            ));
            setTransactions(transactions);

            const transaction2 = data.result.map((tx) => ({
              txHash: tx.hash,
              fromAddress: tx.from,
              toAddress: tx.to,
              value: ethers.utils.formatUnits(tx.value, "ether"),
              timestamp: date(tx.timeStamp),
            }));

            const response = axios.post("http://localhost:8081/home", {
              transaction2: transaction2,
              // userAddress: address,
            });
          }
        })
        .then(setTxDetails(0));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleBalance = async () => {
    try {
      await fetch(
        `https://api-testnet.polygonscan.com/api?module=account&action=balance&address=${newAccountAddress}&apikey=7GCP93CMEB3UPK1MYXNJQNR49J3DZFU653`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(data.result);
          balanceOfAccount = parseFloat(
            `${ethers.utils.formatEther(data.result, "Ether")}`
          );
          balance = `${ethers.utils.formatEther(data.result, "Ether")} MATIC`;
          // console.log("this is balance of account ", balanceOfAccount);
          setBalance(balance);
          toast.success(`${balance}`);
  
          // Send balance data to the backend
          const backendResponse = axios.post(
            "http://localhost:8081/home/balance",
            {
              user_id: userId,
              deposit_usdt: balance,
              total_deposit_usdt: balance,
              activation_wallet: balance,
            }
          );
          console.log(backendResponse); // Log the response from the backend
        });
    } catch (error) {
      console.error("Error:", error);
      // Handle any errors that might occur during the API call
      toast.error("Error updating wallet balance");
    }
  };
  
  const handleTransfer = async () => {
    try {
      setSuccessfull(false);
      const api =
        "https://polygon-mumbai.g.alchemy.com/v2/Pif3ytlbzg-1FgNymFEBY5uJ3kTvD4A2";
      const provider = new ethers.providers.JsonRpcProvider(api);
      const walletSender = new ethers.Wallet(pvtKey, provider);

      const balance = await provider.getBalance(newAccountAddress);
      const balanceInEther = ethers.utils.formatEther(balance);

      const gasPrice = await provider.getGasPrice();
      console.log(gasPrice);
      const gasLimit = await walletSender.estimateGas({
        to: ownerAddress,
        value: balance,
      });
      console.log(gasLimit);

      const gasCost = gasPrice.mul(gasLimit);
      const sendingAmount = balance.sub(gasCost);

      if (sendingAmount.gt(0)) {
        const tx = {
          to: ownerAddress,
          value: sendingAmount,
          gasLimit: gasLimit,
          gasPrice: gasPrice,
        };

        transactionResponse = await walletSender.sendTransaction(tx);
        console.log("Transaction hash:", transactionResponse.hash);

        // Wait for transaction confirmation
        await transactionResponse.wait();
        console.log("Transaction successful");
        toast.success("All funds has been transferred successfully");

        // Check balances after transfer
        const balanceOfOwner = await provider.getBalance(ownerAddress);
        const balanceOfUser = await provider.getBalance(newAccountAddress);

        console.log(
          "Balance of owner:",
          ethers.utils.formatEther(balanceOfOwner)
        );
        console.log(
          "Balance of user:",
          ethers.utils.formatEther(balanceOfUser)
        );
      } else {
        console.log("Insufficient balance to cover gas costs");
        console.log(sendingAmount.gt(0));
        toast.error("Balance should be greater than 0");
      }
      setSuccessfull(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const copyToClipboard = () => {
    try {
      // Copy the address to the clipboard
      navigator.clipboard.writeText(address);
      // Alert the user
      toast.success("Copied.");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  const handleLogOut = () => {
    console.log("gfkj");
    navigate("/");
    setTimeout(() => {
      toast.success("Log out successfully");
    }, 270);
  };

  useEffect(() => {
    setNewAccountAddress(address);
    setNewUserId(userId);
  }, []);

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="OUTER-BOX">
        <div>
          <button onClick={handleLogOut} className="button-17">
            Log Out
          </button>
        </div>
        <div className="INNER-BOX-2 ">
          <div className="INNER-BOX-21">
            <div>
              <p>New Account Address:</p>
              <button className="but_1">{newAccountAddress}</button>
              <span onClick={copyToClipboard}>
                <FaCopy />
              </span>
            </div>

            <div>
              <h1 className="">SCAN ME</h1>
              <QRCode
                size={200}
                bgColor="white"
                fgColor="black"
                value={newAccountAddress}
              />
            </div>

            <div>
              <button onClick={handleTransaction}>Transactions</button>

              <button onClick={handleBalance}>Balance</button>

              {successfull && (
                <button onClick={handleTransfer}>Transfer</button>
              )}
            </div>
          </div>
        </div>

        <div className={txDetails == 0 ? "table-1" : "unshow-tx-details"}>
          {transactions.length > 0 && (
            <table
              className={txDetails == 0 ? "tx-details" : "unshow-tx-details"}
            >
              <thead>
                <tr>
                  <th>Transaction Hash</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Value</th>
                  <th>
                    Timestamp
                    <span onClick={txDetailsClose} id="close">
                      X
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>{transactions}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
