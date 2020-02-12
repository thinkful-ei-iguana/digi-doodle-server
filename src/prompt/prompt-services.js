const promptServices = {
  getAllPrompts(db) {
    return db('prompts').select('prompt');
  }
};

module.exports = promptServices;