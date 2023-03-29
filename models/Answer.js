class Answer {
  constructor({
    id,
    questionId,
    description,
    userId,
    datePosted,
    numUpvotes,
    numDownvotes,
  } = {}) {
    this.id = id;
    this.questionId = questionId;
    this.description = description;
    this.userId = userId;
    this.datePosted = datePosted;
    this.numUpvotes = numUpvotes || 0;
    this.numDownvotes = numDownvotes || 0;
  }
}

module.exports = { Answer };
