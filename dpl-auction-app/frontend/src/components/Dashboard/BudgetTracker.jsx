import React from 'react';

const BudgetTracker = ({ team, formatPrice }) => {
  const spent = team.budget - team.remainingBudget;
  const pct = team.budget > 0 ? (spent / team.budget) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">Budget Used</span>
        <span className="text-gray-300">{pct.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span className="text-green-400">{formatPrice(team.remainingBudget)} left</span>
        <span className="text-red-400">{formatPrice(spent)} spent</span>
      </div>
    </div>
  );
};

export default BudgetTracker;
