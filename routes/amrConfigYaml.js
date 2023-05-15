// const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const { dump, load } = require("js-yaml");
const fs = require("fs");

router.get("/", (req, res) => {
  const yml = fs.readFileSync("assets/amr-config/application-prod.yml");
  const data = load(yml);
  res.status(200).send(data);
});

router.post("/", (req, res) => {
  // const { yml } = req.body;
  const data = dump(req.body, {
    noCompatMode: true,
    noQuotes: true,
    indent: 2,
    lineWidth: -1,
  });

  fs.writeFile("assets/amr-config/application-prod.yml", data, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send({ success: false, error: err });
    } else {
      res.status(200).send({ success: true });
    }
  });
});

module.exports = router;
