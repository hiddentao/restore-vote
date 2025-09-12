import React from 'react';
import { Modal } from './Modal';
import { ExternalLink, Vote, MessageCircle } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          About
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          This platform displays policies from Restore Britain's voting platform, 
          allowing you to browse and search through community-submitted policy proposals.
        </p>  
        <p className="text-gray-600 mb-6 leading-relaxed">
          Each policy shows its ranking based on community votes, category, 
          and the username of the person who submitted it. Click on any policy 
          to view detailed information including the full description and creation date.
        </p>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Use the search functionality to filter policies by title, username, or category 
          to find specific topics of interest.
        </p>
        <div className="space-y-3">
          <a
            href="https://policyvoter.com/restore-britain"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Vote size={20} className="text-blue-600" />
            <span className="font-medium text-blue-800">Go to PolicyVoter</span>
          </a>
          <a
            href="https://www.restorebritain.org.uk/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ExternalLink size={20} className="text-gray-700" />
            <span className="font-medium text-gray-800">Learn about Restore Britain</span>
          </a>
          <a
            href="mailto:hello@halfatheist.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <MessageCircle size={20} className="text-green-600" />
            <span className="font-medium text-green-800">Give feedback on this site</span>
          </a>
        </div>
      </div>
    </Modal>
  );
};