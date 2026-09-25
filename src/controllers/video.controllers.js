import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// GET /api/v1/videos  -> public feed of published videos
const getAllVideos = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const filter = { isPublished: true };
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  const videos = await Video.find(filter)
    .sort({ createdAt: -1 })
    .populate("owner", "username fullname avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

// GET /api/v1/videos/:videoId  -> single video (increments views)
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  ).populate("owner", "username fullname avatar");

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

// GET /api/v1/videos/my  -> videos owned by the logged-in user
const getMyVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ owner: req.user._id })
    .sort({ createdAt: -1 })
    .populate("owner", "username fullname avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Your videos fetched successfully"));
});

// POST /api/v1/videos  -> upload/publish a new video (protected)
const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const videoUpload = await uploadOnCloudinary(videoLocalPath);
  if (!videoUpload?.url) {
    throw new ApiError(500, "Failed to upload video");
  }

  const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnailUpload?.url) {
    throw new ApiError(500, "Failed to upload thumbnail");
  }

  const video = await Video.create({
    title: title.trim(),
    description: description.trim(),
    videoFile: videoUpload.url,
    thumbnail: thumbnailUpload.url,
    duration: videoUpload.duration || 0,
    owner: req.user._id,
  });

  const created = await Video.findById(video._id).populate(
    "owner",
    "username fullname avatar"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, created, "Video published successfully"));
});

// DELETE /api/v1/videos/:videoId  -> delete own video (protected)
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this video");
  }

  await video.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

export {
  getAllVideos,
  getVideoById,
  getMyVideos,
  publishVideo,
  deleteVideo,
};
