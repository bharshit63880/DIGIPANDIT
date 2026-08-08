const asyncHandler = require("../utils/asyncHandler");
const { getPanditJiResponse } = require("../services/panditJiService");

const chatWithPanditJi = asyncHandler(async (req, res) => {
  const { message, history, pathname } = req.body || {};
  const response = getPanditJiResponse({
    message,
    history: Array.isArray(history) ? history.slice(-10) : [],
    pathname: typeof pathname === "string" ? pathname : "/",
  });

  res.json({
    success: true,
    data: {
      name: "PanditJi",
      ...response,
    },
  });
});

module.exports = { chatWithPanditJi };
