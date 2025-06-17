import { MetaMaskSDK } from '@metamask/sdk';
import { ethers } from 'ethers';

let ethereum;
let provider;
let signer;
let sdk;

export const initializeMetaMask = async () => {
  try {
    // 初始化 MetaMask SDK
    sdk = new MetaMaskSDK({
      dappMetadata: {
        name: "投票 DApp",
        description: "一个基于以太坊的投票应用",
        url: window.location.href,
      }
    });
    
    ethereum = sdk.getProvider();
    
    // 检查是否已连接
    if (!ethereum) {
      throw new Error("请安装 MetaMask!");
    }
    
    provider = new ethers.providers.Web3Provider(ethereum);
    signer = provider.getSigner();
    
    return {
      ethereum,
      provider,
      signer
    };
  } catch (error) {
    console.error("MetaMask 初始化失败:", error);
    throw error;
  }
};

export const connectWallet = async () => {
  try {
    if (!ethereum) {
      await initializeMetaMask();
    }
    
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error("连接钱包失败:", error);
    throw error;
  }
};

export const getChainId = async () => {
  try {
    if (!ethereum) {
      await initializeMetaMask();
    }
    
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainId, 16);
  } catch (error) {
    console.error("获取链 ID 失败:", error);
    throw error;
  }
};

export const getAccount = async () => {
  try {
    if (!ethereum) {
      await initializeMetaMask();
    }
    
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    return accounts[0] || null;
  } catch (error) {
    console.error("获取账户失败:", error);
    return null;
  }
};

export const listenToAccountChanges = (callback) => {
  if (!ethereum) return;
  
  ethereum.on('accountsChanged', (accounts) => {
    callback(accounts[0] || null);
  });
};

export const listenToChainChanges = (callback) => {
  if (!ethereum) return;
  
  ethereum.on('chainChanged', (chainId) => {
    callback(parseInt(chainId, 16));
  });
};

export const getSigner = async () => {
  if (!signer) {
    await initializeMetaMask();
  }
  return signer;
};

export const getProvider = async () => {
  if (!provider) {
    await initializeMetaMask();
  }
  return provider;
}; 