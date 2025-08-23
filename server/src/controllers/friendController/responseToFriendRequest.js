import User from "../../models/user.models.js";

export const respondToFriendRequest = async (req, res) => {
  const { requesterId, action } = req.body; // action: 'accept' or 'reject'
  const userId = req?.user._id;
  
  console.log(userId, requesterId, action);
  

  if (!["accept", "reject"].includes(action)) {
    return res.status(400).json({
      status: false,
      message: "Invalid action"
    });
  }

  const user = await User.findById(userId);
  const requester = await User.findById(requesterId);

  if (!user || !requester) return res.status(404).json({
    status: false,
    message: "User not found"
  });

  const updateStatus = action === "accept" ? "accepted" : "rejected";

  // Update both users
  const updateFriendStatus = (friendsList, targetId) => {
    let friend = friendsList.find(f => f.user.toString() === targetId);
    if (friend) {
      friend.status = updateStatus;
    } else if (action === "accept") {
      friendsList.push({ user: targetId, status: updateStatus });
    }
  };

  updateFriendStatus(user.friends, requesterId);
  user.markModified("friends");
  updateFriendStatus(requester.friends, userId);
  requester.markModified("friends");

  await user.save();
  await requester.save();


  res.json({
    success: true,
    status: true,
    message: `${updateStatus}`
  });
};
