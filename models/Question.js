class Question {
  constructor({
    id,
    userId,
    datePosted,
    categories,
    title,
    description,
    answerIds,
  }) {
    this.id = id;
    this.userId = userId;
    this.datePosted = datePosted;
    this.categories = !categories ? [] : categories;
    this.title = title;
    this.description = description || "";
    this.answerIds = !answerIds ? [] : answerIds;
  }
}

module.exports = { Question };
