const { StatusCodes } = require("http-status-codes");
const Booking = require("../models/Booking");
const PanditProfile = require("../models/PanditProfile");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

function derivePanditServiceType(service) {
  if (service.serviceType && service.serviceType !== "CONSULTATION") {
    return service.serviceType;
  }

  const label = `${service.name} ${service.description || ""}`.toLowerCase();
  if (label.includes("hawan")) {
    return "HAWAN";
  }

  if (label.includes("katha")) {
    return "KATHA";
  }

  return "PUJA";
}

function getServiceAddons(service) {
  return {
    travelCharge: service.travelCharge || 0,
    samagriCost: service.samagriCost || 0,
    extraDakshina: service.extraDakshina || 0,
    videoDakshinaFee: service.videoDakshinaFee || 0,
  };
}

const listPanditServices = asyncHandler(async (req, res) => {
  const { city, serviceType } = req.validated?.query || req.query || {};
  const filter = {
    approvalStatus: "APPROVED",
    "services.category": "PUJA",
  };

  if (city) {
    filter.serviceCities = { $in: [city] };
  }

  const profiles = await PanditProfile.find(filter)
    .populate("user", "name avatar city state")
    .sort({ ratingAverage: -1, totalReviews: -1, createdAt: -1 });

  const data = profiles
    .map((profile) => ({
      _id: profile._id,
      name: profile.user?.name,
      avatar: profile.user?.avatar,
      bio: profile.bio,
      ratingAverage: profile.ratingAverage,
      totalReviews: profile.totalReviews,
      serviceCities: profile.serviceCities || [],
      services: (profile.services || [])
        .filter((service) => service.category === "PUJA" && service.isActive)
        .map((service) => ({
          serviceId: service._id,
          name: service.name,
          description: service.description,
          serviceType: derivePanditServiceType(service),
          basePrice: service.price,
          durationInMinutes: service.durationInMinutes,
          addons: getServiceAddons(service),
        }))
        .filter((service) => !serviceType || service.serviceType === serviceType),
    }))
    .filter((profile) => profile.services.length > 0);

  res.json({
    success: true,
    data,
  });
});

const bookPandit = asyncHandler(async (req, res) => {
  const {
    panditProfileId,
    serviceId,
    scheduleAt,
    address,
    notes,
    meetingMode,
    travelCharge,
    samagriCost,
    extraDakshina,
    videoDakshinaFee,
  } = req.validated.body;

  const profile = await PanditProfile.findById(panditProfileId).populate("user", "name");
  if (!profile || profile.approvalStatus !== "APPROVED") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Pandit profile is not available for booking");
  }

  const service = profile.services.id(serviceId);
  if (!service || !service.isActive || service.category !== "PUJA") {
    throw new ApiError(StatusCodes.NOT_FOUND, "Selected pandit service not found");
  }

  const basePrice = service.price;
  const resolvedTravelCharge = meetingMode === "ONLINE" ? 0 : travelCharge ?? service.travelCharge ?? 0;
  const resolvedSamagriCost = samagriCost ?? service.samagriCost ?? 0;
  const resolvedExtraDakshina = extraDakshina ?? service.extraDakshina ?? 0;
  const resolvedVideoDakshinaFee =
    meetingMode === "ONLINE" ? videoDakshinaFee ?? service.videoDakshinaFee ?? 0 : 0;
  const total = basePrice + resolvedTravelCharge + resolvedSamagriCost + resolvedExtraDakshina + resolvedVideoDakshinaFee;

  const booking = await Booking.create({
    bookingType: "PUJA",
    user: req.user._id,
    pandit: profile.user._id,
    panditProfile: profile._id,
    serviceId: service._id,
    serviceName: service.name,
    servicePrice: basePrice,
    pricingBreakdown: {
      basePrice,
      travelCharge: resolvedTravelCharge,
      samagriCost: resolvedSamagriCost,
      extraDakshina: resolvedExtraDakshina,
      videoDakshinaFee: resolvedVideoDakshinaFee,
      total,
    },
    scheduleAt: new Date(scheduleAt),
    durationInMinutes: service.durationInMinutes,
    address: meetingMode === "ONLINE" ? undefined : address,
    notes,
    meetingMode,
    payment: {
      amount: total,
      status: "CREATED",
    },
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Pandit booking created successfully",
    data: booking,
  });
});

module.exports = {
  listPanditServices,
  bookPandit,
};
