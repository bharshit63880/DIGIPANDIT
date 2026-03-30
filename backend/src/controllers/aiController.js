const asyncHandler = require("../utils/asyncHandler");
const { getPanditJiResponse } = require("../services/panditJiService");

const chatWithPanditJi = asyncHandler(async (req, res) => {
  const { message } = req.body || {};
  const response = getPanditJiResponse({ message });

  res.json({
    success: true,
    data: {
      name: "PanditJi",
      ...response,
    },
  });
});

module.exports = { chatWithPanditJi };
