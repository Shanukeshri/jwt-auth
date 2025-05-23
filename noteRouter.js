const router = require("express").Router();
const note = require("./noteModel.js");


router.get("/",async (req, res) => {

  const username = req.user;
  noteArray = await note.find({ username });
  if (!noteArray) {
    return res.status(400).json({ msg: "No notes found" });
  }
  noteArray = noteArray.map(ele =>  ele.note);
  noteNew = noteArray.join(".");
  
  return res.status(200).json({ note: noteNew });
});

router.post("/", isAuth,async (req, res) => {

  newNote = new note({ note: req.body.note, username: req.username });
  await newNote.save();
  return res.status(200).json({ msg: "Note Added Successfully" });
});

module.exports = router;
