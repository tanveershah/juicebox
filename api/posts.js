const express = require("express");
const postRouter = express.Router();

const { getAllPosts } = require("../db");

postRouter.use("/", (req, res, next) => {
  console.log("A request is being made to /posts");

  next();
});

postRouter.get("/", async (req, res, next) => {
  try {
    const posts = await getAllPosts();

    res.send({
      posts,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = postRouter;
