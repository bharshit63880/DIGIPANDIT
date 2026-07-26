const buildPagedResponse = ({ docs, total, page, limit }) => ({
  data: docs,
  meta: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  },
});

module.exports = buildPagedResponse;
