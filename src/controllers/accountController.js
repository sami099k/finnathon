const { randomUUID } = require('crypto');

const account = {
  id: 'demo-account',
  currency: 'USD',
  balance: 10000,
  history: [],
};

function respondBalance(req, res) {
  const clientId = req.ip;
  const summary = {
    accountId: account.id,
    balance: account.balance,
    currency: account.currency,
    clientId,
  };
  res.json(summary);
}

function recordTransaction(entry) {
  account.history.unshift(entry);
  // keep recent 100 transactions for the demo
  if (account.history.length > 100) {
    account.history.length = 100;
  }
}

function processTransaction(req, res, next) {
  try {
    const { type, amount, reference } = req.body || {};
    if (!type || !['credit', 'debit'].includes(type)) {
      return res.status(400).json({ message: 'type must be credit or debit' });
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'amount must be a positive number' });
    }

    if (type === 'debit' && numericAmount > account.balance) {
      return res.status(401).json({ message: 'insufficient funds' });
    }

    const delta = type === 'credit' ? numericAmount : -numericAmount;
    account.balance += delta;

    const entry = {
      id: randomUUID(),
      type,
      amount: numericAmount,
      reference: reference || 'N/A',
      balanceAfter: account.balance,
      at: new Date().toISOString(),
      clientId: req.ip,
    };

    recordTransaction(entry);
    res.status(201).json({ message: 'transaction recorded', entry });
  } catch (err) {
    next(err);
  }
}

function getHistory(req, res) {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  res.status(200).json({ accountId: account.id, count: limit, items: account.history.slice(0, limit) });
}

module.exports = {
  respondBalance,
  processTransaction,
  getHistory,
};
