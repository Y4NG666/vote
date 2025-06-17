import React, { useState, useEffect } from 'react';
import { connectWallet, getAccount, listenToAccountChanges, listenToChainChanges, getChainId } from '../utils/metamask';

const ConnectWallet = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const currentAccount = await getAccount();
        if (currentAccount) {
          setAccount(currentAccount);
          const currentChainId = await getChainId();
          setChainId(currentChainId);
        }
        
        listenToAccountChanges(setAccount);
        listenToChainChanges(setChainId);
      } catch (err) {
        console.error("初始化钱包状态失败:", err);
        setError("初始化钱包状态失败");
      }
    };
    
    init();
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);
      const currentChainId = await getChainId();
      setChainId(currentChainId);
    } catch (err) {
      console.error("连接钱包失败:", err);
      setError("连接钱包失败");
    } finally {
      setIsLoading(false);
    }
  };

  const getNetworkName = (id) => {
    switch (id) {
      case 1: return "以太坊主网";
      case 11155111: return "Sepolia 测试网";
      case 5: return "Goerli 测试网";
      case 80001: return "Polygon Mumbai";
      case 137: return "Polygon";
      default: return `未知网络 (ID: ${id})`;
    }
  };

  return (
    <div className="wallet-connector">
      {!account ? (
        <button onClick={handleConnect} disabled={isLoading}>
          {isLoading ? "连接中..." : "连接 MetaMask"}
        </button>
      ) : (
        <div className="wallet-info">
          <div className="account">
            <span>已连接: </span>
            <span>{`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</span>
          </div>
          {chainId && (
            <div className="network">
              <span>网络: </span>
              <span>{getNetworkName(chainId)}</span>
            </div>
          )}
        </div>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default ConnectWallet; 