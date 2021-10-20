const tagRouter = require("express").Router();

const { getAllTags } = require("../db");

tagRouter.use("/", (req, res, next) => {
  console.log("A request is being made to /tags");

  next();
});

tagRouter.get("/", async (req, res) => {
  try {
    const tags = await getAllTags();

    res.send({
      tags,
    });
  } catch (error) {
    console.error(error);
  }
});

module.exports = tagRouter;
