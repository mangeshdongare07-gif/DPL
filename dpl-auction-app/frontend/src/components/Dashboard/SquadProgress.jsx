import React from 'react';

const SquadProgress = ({ team }) => {
  return (
    <div className="flex gap-3 mt-2">
      <div className="flex-1">
        <div className="flex justify-between text-xs text-blue-300 mb-1">
          <span>Male</span><span>{team.maleCount}/5</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(team.maleCount / 5) * 100}%` }} />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs text-pink-300 mb-1">
          <span>Female</span><span>{team.femaleCount}/2</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: `${(team.femaleCount / 2) * 100}%` }} />
        </div>
      </div>
    </div>
  );
};

export default SquadProgress;
