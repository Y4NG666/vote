import React, { useState, useEffect } from 'react';
import './App.css';
import ConnectWallet from './components/ConnectWallet';
import CreateProposal from './components/CreateProposal';
import VotingList from './components/VotingList';
import { getAccount } from './utils/metamask';

function App() {
  const [account, setAccount] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const contractAddress = "YOUR_CONTRACT_ADDRESS"; // 部署后需要替换为您的合约地址

  useEffect(() => {
    const checkAccount = async () => {
      const currentAccount = await getAccount();
      setAccount(currentAccount);
    };
    
    checkAccount();
    
    // 每 5 秒刷新一次账户状态
    const interval = setInterval(checkAccount, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleProposalCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>去中心化投票应用</h1>
        <ConnectWallet />
      </header>
      
      <main>
        {account ? (
          <>
            <CreateProposal 
              contractAddress={contractAddress} 
              onProposalCreated={handleProposalCreated} 
            />
            <VotingList 
              contractAddress={contractAddress} 
              refreshTrigger={refreshTrigger}
            />
          </>
        ) : (
          <div className="connect-notice">
            请连接您的 MetaMask 钱包以使用该应用
          </div>
        )}
      </main>
      
      <footer>
        <p>基于以太坊和 MetaMask 的去中心化投票应用</p>
      </footer>
    </div>
  );
}

export default App; 