import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import CurrencyField from '../components/CurrencyField'
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  getWethContract,
  getUniContract,
  getPrice,
  runSwap
} from "./router";

export default function Home() {
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined)
  const [signerAddress, setSignerAddress] = useState(undefined)
  
  const [deadlineMinutes, setDeadlineMinutes] = useState(10)
  const [slippageAmount, setSlippageAmount] = useState(2)
  const [inputAmount, setInputAmount] = useState(undefined)
  const [outputAmount, setOutputAmount] = useState(undefined)
  const [transaction, setTransaction] = useState(undefined)
  const [loading, setLoading] = useState(undefined)
  const [ratio, setRatio] = useState(undefined)
  const [wethContract, setWethContract] = useState(undefined)
  const [uniContract, setUniContract] = useState(undefined)
  const [wethAmount, setWethAmount] = useState(undefined)
  const [uniAmount, setUniAmount] = useState(undefined)
  
  useEffect(() => {
    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      const wethContract = getWethContract()
      setWethContract(wethContract)

      const uniContract = getUniContract()
      setUniContract(uniContract)
    };
    onLoad();
  }, []);

  const getSigner = async provider => {
    provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    setSigner(signer)
  }

  const isConnected = () => signer !== undefined;
  const getWalletAddress = () => {
    signer.getAddress()
      .then(address => {
        setSignerAddress(address)

        wethContract.balanceOf(address).then(res => {
          setWethAmount(Number(ethers.utils.formatEther(res)));
        });
        uniContract.balanceOf(address).then(res => {
          setUniAmount(Number(ethers.utils.formatEther(res)));
        });
      })
  }

  if (signer !== undefined) {
    getWalletAddress()
  }

  const getSwapPrice = (inputAmount) => {
    setLoading(true)
    setInputAmount(inputAmount)

    const swap = getPrice(
      inputAmount,
      slippageAmount,
      Math.floor(Date.now()/1000 + (deadlineMinutes * 60)),
      signerAddress
    ).then(data => {
      setTransaction(data[0])
      setOutputAmount(data[1])
      setRatio(data[2])
      setLoading(false)
    })
  }

  return (
    <div className={styles.container}>

      <main className={styles.main}>
          <div>
          {isConnected() ? (
            <div className={styles.walletAddress}>
              {signerAddress}
            </div>
          ) : (
            <button className={styles.card}
              className={styles.connectButton}
              onClick={() => getSigner(provider)}
            >
              Connect Wallet
            </button>
          )}
          </div>
          <div className={styles.swapContainer}>
            <div className={styles.swapHeader}>
              <span className={styles.swapText}>Swap</span>
            </div>

            <div className={styles.swapBody}>
              <CurrencyField
                field="input"
                tokenName="WETH"
                getSwapPrice={getSwapPrice}
                signer={signer}
                balance={wethAmount}
              />
              <div className={styles.center}>to</div>
              <CurrencyField
                field="output"
                tokenName="UNI"
                value={outputAmount}
                signer={signer}
                balance={uniAmount}
                loading={loading}
              />
            </div>

            <div className={styles.swapButtonContainer}>
              <div className={styles.swapButton} onClick={() => runSwap(transaction, signer)}>
                Swap
              </div>
            </div>
          </div>
      </main>
    </div>
  )
}
