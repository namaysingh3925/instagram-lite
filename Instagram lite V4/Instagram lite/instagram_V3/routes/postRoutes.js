const express = require("express");

const postController = require("../controllers/postController");
const authMiddleware =  require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  postController.createPost
);

router.get(
  "/:id",
  authMiddleware,
  postController.getPost
);

router.put(
  "/:id",
  authMiddleware,
  postController.updatePost
);

router.delete(
  "/:id",
  authMiddleware,
  postController.deletePost
);

router.post(
  "/:id/like",
  authMiddleware,
  postController.likePost
);

router.delete(
  "/:id/like",
  authMiddleware,
  postController.unlikePost
);

module.exports = router;
