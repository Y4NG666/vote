import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getSigner } from '../utils/metamask';
import votingAbi from '../contracts/Voting.json'; // 需要导出合约 ABI

const CreateProposal = ({ contractAddress, onProposalCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60); // 默认为 60 分钟
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description) {
      setError('请填写所有必填字段');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(contractAddress, votingAbi.abi, signer);
      
      const tx = await contract.createProposal(title, description, duration);
      await tx.wait();
      
      setSuccess('提案创建成功！');
      setTitle('');
      setDescription('');
      setDuration(60);
      
      if (onProposalCreated) {
        onProposalCreated();
      }
    } catch (err) {
      console.error("创建提案失败:", err);
      setError(`创建提案失败: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-proposal">
      <h2>创建新提案</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">标题</label>
          <input 
            type="text" 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">描述</label>
          <textarea 
            id="description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="duration">持续时间（分钟）</label>
          <input 
            type="number" 
            id="duration" 
            value={duration} 
            onChange={(e) => setDuration(parseInt(e.target.value))} 
            min="1"
            disabled={isLoading}
            required
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? "处理中..." : "创建提案"}
        </button>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </form>
    </div>
  );
};

export default CreateProposal; 