const Counter = require('../models/counter.model');

const getNextSequence = async (key) => {
  const counter = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  return counter.seq;
};

module.exports = {
  getNextSequence
};