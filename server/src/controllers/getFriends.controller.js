import User from "../models/user.models.js";

export const getFriends = async (req, res) => {
  const user = await User.findById(req?.user._id).populate("friends.user", "username email avatarUrl");

  const accepted = user.friends.filter(f => f.status === "accepted");
  const pending = user.friends.filter(f => f.status === "pending");

  res.json({
    status: true,
    message: "Friends retrieved successfully",
    friendsList: {
      accepted,
      pending,
    },
  });
};
