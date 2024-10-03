const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const io = require("socket.io");

exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const senderId = req.user._id;

    // Check if the chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Create the message
    const message = await Message.create({
      sender: senderId,
      chat: chatId,
      content,
    });

    // Optionally, you can update the lastMessage field in the chat (if you have it)
    chat.lastMessage = message._id;
    await chat.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Find all messages for the given chat ID
    const messages = await Message.find({ chat: chatId }).populate(
      "sender",
      "fullName"
    );

    if (!messages || messages.length === 0) {
      return res.status(404).json({ message: "No messages found" });
    }

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};
