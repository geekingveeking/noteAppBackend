const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const Notes = require("../models/Notes");
const { findById } = require("../models/User");
const router = express.Router();

//endpoint to fetch user notes.usin GET request. /fetchallnotes
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
  
    const notes = await Notes.find({ user: userId });
    res.send(notes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error occured");
  }
});
//endpoint to add user notes.usin POST request
router.post(
  "/createnotes",
  [
    body("title", "Title must be atleast 1 characters").isLength({ min: 1 }),
    body("description", "description must be atleast  1 in length").isLength({
      min: 1,
    }),
  ],
  fetchuser,
  async (req, res) => {
    //if error returns bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let noteUser = await Notes.create({
        user: req.user.id,
        title: req.body.title,
        description: req.body.description,
        tag: req.body.tag,
      });
      res.send(noteUser);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error occured");
    }
  }
);

//endpoint to update user notes.usin put request.
router.put("/updatenotes/:id", fetchuser, async (req, res) => {
  //if error returns bad request

  try {
    let note = await Notes.findById(req.params.id);
  
    if (!note) {
     
      res.status(404).send("Not Found");
      return
    }

    if (note.user.toString() !== req.user.id) {
      res.status(401).send("Not Allowed");
      return;
    }

    if (req.body.title) {
      note.title = req.body.title;
    }
    if (req.body.description) {
      note.description = req.body.description;
    }
    if (req.body.tag) note.tag = req.body.tag;
    await Notes.findByIdAndUpdate(req.params.id, { $set: note }, { new: true });
    res.json(note);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error occured");
  }
});

//endpoint to update user notes.usin put request.
router.delete("/deletenotes/:id", fetchuser, async (req, res) => {
  //if error returns bad request

  try {
    let note = await Notes.findById(req.params.id);
    if (!note) {
      res.status(404).send("Not Found");
      return;
    }
    

    if (note.user.toString() !== req.user.id) {
      res.status(401).send("Not Allowed");
      return;
    }

    await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", note: note });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error occured");
  }
});
module.exports = router;
