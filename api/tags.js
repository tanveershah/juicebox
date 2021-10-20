const tagRouter = require("express").Router();

const { getAllTags, getPostsByTagName } = require("../db");

tagRouter.use("/", (req, res, next) => {
  console.log("A request is being made to /tags");

  next();
});

tagRouter.get("/", async (req, res, next) => {
  try {
    const tags = await getAllTags();

    res.send({
      tags,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

tagRouter.get("/:tagName/posts", async (req, res, next) => {
  const { tagName } = req.params;

  try {
    const allPosts = await getPostsByTagName(tagName);

    const posts = allPosts.filter((post) => {
      if (post.active) {
        return true;
      }

      if (req.user && req.user.id === post.author.id) {
        return true;
      }

      return false;
    });

    res.send({ posts });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = tagRouter;
