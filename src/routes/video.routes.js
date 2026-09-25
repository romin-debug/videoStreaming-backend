import { Router } from "express";
import {
  getAllVideos,
  getVideoById,
  getMyVideos,
  publishVideo,
  deleteVideo,
} from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Public routes
router.route("/").get(getAllVideos);

// Secured routes (define specific paths before "/:videoId")
router.route("/my").get(verifyJWT, getMyVideos);

router.route("/").post(
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishVideo
);

router.route("/:videoId").get(getVideoById);
router.route("/:videoId").delete(verifyJWT, deleteVideo);

export default router;
