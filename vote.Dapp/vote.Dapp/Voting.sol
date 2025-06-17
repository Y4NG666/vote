// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Voting {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 createdAt;
        uint256 endTime;
        bool closed;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public proposalCount = 0;

    event ProposalCreated(uint256 indexed id, string title, string description, uint256 endTime);
    event Voted(uint256 indexed proposalId, address indexed voter, bool vote);
    event ProposalClosed(uint256 indexed proposalId);

    function createProposal(string memory _title, string memory _description, uint256 _durationInMinutes) public {
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        uint256 id = proposalCount;
        proposals[id] = Proposal({
            id: id,
            title: _title,
            description: _description,
            yesVotes: 0,
            noVotes: 0,
            createdAt: block.timestamp,
            endTime: block.timestamp + (_durationInMinutes * 1 minutes),
            closed: false
        });
        
        proposalCount++;
        
        emit ProposalCreated(id, _title, _description, proposals[id].endTime);
    }

    function vote(uint256 _proposalId, bool _vote) public {
        require(_proposalId < proposalCount, "Proposal does not exist");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");
        require(block.timestamp < proposals[_proposalId].endTime, "Voting period has ended");
        require(!proposals[_proposalId].closed, "Proposal is closed");
        
        if (_vote) {
            proposals[_proposalId].yesVotes++;
        } else {
            proposals[_proposalId].noVotes++;
        }
        
        hasVoted[_proposalId][msg.sender] = true;
        
        emit Voted(_proposalId, msg.sender, _vote);
    }

    function closeProposal(uint256 _proposalId) public {
        require(_proposalId < proposalCount, "Proposal does not exist");
        require(block.timestamp >= proposals[_proposalId].endTime, "Voting period not ended yet");
        require(!proposals[_proposalId].closed, "Proposal already closed");
        
        proposals[_proposalId].closed = true;
        
        emit ProposalClosed(_proposalId);
    }

    function getProposal(uint256 _proposalId) public view returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 createdAt,
        uint256 endTime,
        bool closed
    ) {
        require(_proposalId < proposalCount, "Proposal does not exist");
        Proposal memory proposal = proposals[_proposalId];
        
        return (
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.createdAt,
            proposal.endTime,
            proposal.closed
        );
    }

    function getProposalsCount() public view returns (uint256) {
        return proposalCount;
    }
} 