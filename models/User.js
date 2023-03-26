const User = function ({ id, name, from, bio } = {}) {
  return {
    id: id,
    name: name,
    bio: !bio ? `Be the best version of yourself` : bio,
    from: !from ? "Ahmedabad" : from,
    questionIds: [], //ids
    answerIds: [], //ids
    upvotedAnswerIds: [], //ids
    downvotedAnswerIds: [], //ids
  };
};

module.exports = { User };
