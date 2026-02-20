const validatePlayer = (req, res, next) => {
  const { name, gender } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Player name is required' });
  }
  if (!gender || !['male', 'female'].includes(gender.toLowerCase())) {
    return res.status(400).json({ error: 'Gender must be male or female' });
  }
  req.body.name = name.trim();
  req.body.gender = gender.toLowerCase();
  next();
};

const validateBid = (req, res, next) => {
  const { teamId, amount, playerId } = req.body;
  if (!teamId) return res.status(400).json({ error: 'teamId is required' });
  if (!playerId) return res.status(400).json({ error: 'playerId is required' });
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Valid bid amount is required' });
  }
  next();
};

module.exports = { validatePlayer, validateBid };
