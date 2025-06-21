import User from "../models/user.models.js";


export const sendFriendRequest = async (req, res) => {
  const { recipientId } = req?.body; // id of the user to befriend
  const senderId = req?.user._id;

  if (!recipientId || !senderId) return res.status(400).json({
    status: false,
    message: "no recipientId or senderId."
  });

  if (senderId === recipientId) return res.status(400).json({
    status: false,
    message: "Cannot add yourself."
  });

  const sender = await User.findById(senderId);
  const recipient = await User.findById(recipientId);

  // Check if already exists
  const alreadyFriend = sender.friends.find(f => f.user.toString() === recipientId);
  if (alreadyFriend) return res.status(400).json({
    status: false,
    message: "Friend request already sent or exists."
  });

  // Add pending to both users
  sender.friends.push({ user: recipientId, status: "pending" });
  recipient.friends.push({ user: senderId, status: "pending" });

  await sender.save();
  await recipient.save();

  res.json({ status: true, message: "Friend request sent." });
};
