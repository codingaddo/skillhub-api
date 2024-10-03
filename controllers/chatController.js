const Chat = require("../models/chatModel");

exports.createChat = async (req, res) => {
  try {
    const { buyerId, sellerId } = req.body;

    // Create new chat
    const chat = await Chat.create({
      participants: [buyerId, sellerId],
    });

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: "Server error", error });
  }
};

exports.getChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({ participants: userId })
      .populate("participants", "fullName")
      .populate("lastMessage");

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
