import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getSigner, getAccount } from '../utils/metamask';
import votingAbi from '../contracts/Voting.json'; // 需要导出合约 ABI

const VotingList = ({ contractAddress, refreshTrigger }) => {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [votingStatus, setVotingStatus] = useState({});

  useEffect(() => {
    fetchProposals();
  }, [contractAddress, refreshTrigger]);

  const fetchProposals = async () => {
    setIsLoading(true);
    setError('');

    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(contractAddress, votingAbi.abi, signer);
      const account = await getAccount();
      
      const count = await contract.getProposalsCount();
      const proposalPromises = [];
      
      for (let i = 0; i < count; i++) {
        proposalPromises.push(fetchProposalDetails(contract, i, account));
      }
      
      const proposalResults = await Promise.all(proposalPromises);
      setProposals(proposalResults);
    } catch (err) {
      console.error("获取提案失败:", err);
      setError(`获取提案失败: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProposalDetails = async (contract, id, account) => {
    const proposal = await contract.getProposal(id);
    const hasVoted = account ? await contract.hasVoted(id, account) : false;
    
    return {
      id: proposal.id.toNumber(),
      title: proposal.title,
      description: proposal.description,
      yesVotes: proposal.yesVotes.toNumber(),
      noVotes: proposal.noVotes.toNumber(),
      createdAt: new Date(proposal.createdAt.toNumber() * 1000),
      endTime: new Date(proposal.endTime.toNumber() * 1000),
      closed: proposal.closed,
      hasVoted
    };
  };

  const handleVote = async (proposalId, voteValue) => {
    setVotingStatus(prev => ({ ...prev, [proposalId]: 'pending' }));
    setError('');
    
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(contractAddress, votingAbi.abi, signer);
      
      const tx = await contract.vote(proposalId, voteValue);
      await tx.wait();
      
      setVotingStatus(prev => ({ ...prev, [proposalId]: 'success' }));
      fetchProposals(); // 刷新列表
    } catch (err) {
      console.error("投票失败:", err);
      setVotingStatus(prev => ({ ...prev, [proposalId]: 'error' }));
      setError(`投票失败: ${err.message}`);
    }
  };

  const handleCloseProposal = async (proposalId) => {
    setVotingStatus(prev => ({ ...prev, [proposalId]: 'pending' }));
    setError('');
    
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(contractAddress, votingAbi.abi, signer);
      
      const tx = await contract.closeProposal(proposalId);
      await tx.wait();
      
      setVotingStatus(prev => ({ ...prev, [proposalId]: 'success' }));
      fetchProposals(); // 刷新列表
    } catch (err) {
      console.error("关闭提案失败:", err);
      setVotingStatus(prev => ({ ...prev, [proposalId]: 'error' }));
      setError(`关闭提案失败: ${err.message}`);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleString();
  };

  return (
    <div className="proposals-list">
      <h2>投票提案</h2>
      
      {isLoading ? (
        <div className="loading">加载提案中...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : proposals.length === 0 ? (
        <div className="empty">没有可用的提案</div>
      ) : (
        <div className="proposals">
          {proposals.map(proposal => (
            <div key={proposal.id} className="proposal-card">
              <h3>{proposal.title}</h3>
              <p className="description">{proposal.description}</p>
              
              <div className="proposal-details">
                <div className="votes">
                  <span className="yes-votes">赞成: {proposal.yesVotes}</span>
                  <span className="no-votes">反对: {proposal.noVotes}</span>
                </div>
                
                <div className="dates">
                  <div>创建时间: {formatDate(proposal.createdAt)}</div>
                  <div>结束时间: {formatDate(proposal.endTime)}</div>
                </div>
                
                <div className="status">
                  状态: {proposal.closed ? '已关闭' : (new Date() > proposal.endTime ? '投票期已结束' : '投票中')}
                </div>
              </div>
              
              {!proposal.closed && new Date() <= proposal.endTime && !proposal.hasVoted && (
                <div className="voting-actions">
                  <button 
                    onClick={() => handleVote(proposal.id, true)}
                    disabled={votingStatus[proposal.id] === 'pending'}
                  >
                    赞成
                  </button>
                  <button 
                    onClick={() => handleVote(proposal.id, false)}
                    disabled={votingStatus[proposal.id] === 'pending'}
                  >
                    反对
                  </button>
                </div>
              )}
              
              {proposal.hasVoted && (
                <div className="voted-notice">您已经投票</div>
              )}
              
              {!proposal.closed && new Date() > proposal.endTime && (
                <button 
                  className="close-proposal" 
                  onClick={() => handleCloseProposal(proposal.id)}
                  disabled={votingStatus[proposal.id] === 'pending'}
                >
                  关闭提案
                </button>
              )}
              
              {votingStatus[proposal.id] === 'pending' && (
                <div className="status-message">处理中...</div>
              )}
              {votingStatus[proposal.id] === 'success' && (
                <div className="status-message success">操作成功！</div>
              )}
              {votingStatus[proposal.id] === 'error' && (
                <div className="status-message error">操作失败</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VotingList; 