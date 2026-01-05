import React from 'react';
import { RxCrossCircled } from 'react-icons/rx';

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose, }) => {
  return (
    <div className={`flex items-center justify-center p-4 relative deleteac  dark:bg-[#212020] dark:rounded-lg`}>
      <h3 className="font-poppins text-lg font-medium text-textcolor">{title}</h3>
      <div className="absolute right-4 cursor-pointer" onClick={onClose}>
        <RxCrossCircled className="text-lg text-textcolor" />
      </div>
    </div>
  );
};

export default ModalHeader;
