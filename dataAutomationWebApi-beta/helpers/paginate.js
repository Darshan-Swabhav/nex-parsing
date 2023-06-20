module.exports = {
  paginate: ({ pageNo, pageSize }) => {
    const offset = pageNo * pageSize;
    const limit = pageSize;

    return {
      offset,
      limit,
    };
  },
};
