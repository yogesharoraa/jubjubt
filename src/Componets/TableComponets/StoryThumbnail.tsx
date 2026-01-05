import React from 'react';
import { FaPlay } from 'react-icons/fa';

interface StoryThumbnailProps {
  url: string;
  storyId: number | string;
  onClick: (storyId: number | string) => void;
}

const StoryThumbnail: React.FC<StoryThumbnailProps> = ({ url, storyId, onClick }) => {
  return (
    <div
      className="relative w-14 h-14 cursor-pointer"
      onClick={() => onClick(storyId)}
    >
      <img
        src={url}
        className="object-cover rounded-lg w-full h-full"
        alt="Story thumbnail"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white bg-opacity-70 p-1.5 rounded-full">
          <FaPlay className="text-black text-[10px]" />
        </div>
      </div>
    </div>
  );
};

export default StoryThumbnail;
