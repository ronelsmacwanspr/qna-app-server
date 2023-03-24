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
    this.numUpvotes = numUpvotes;
    this.numDownvotes = numDownvotes;
  }
}

module.exports = { Answer };
