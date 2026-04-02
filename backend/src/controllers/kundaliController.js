const asyncHandler = require("../utils/asyncHandler");
const { generateKundali } = require("../services/astrologyService");
const { generateKundaliInterpretation } = require("../services/interpretationService");

const createKundali = asyncHandler(async (req, res) => {
  const input = req.validated?.body || req.body;
  const kundali = generateKundali(input);
  const interpretation = generateKundaliInterpretation(kundali);

  res.json({
    success: true,
    data: {
      kundali,
      interpretation,
    },
  });
});

module.exports = {
  createKundali,
};
