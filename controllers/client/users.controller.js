const User = require("../../models/user.model");
const usersocket = require("../../sockets/client/users.socket");
const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const paginationHelper = require("../../helpers/pagination");
const pagination = require("../../helpers/pagination");
const RoomChat = require("../../models/rooms-chat.model");
// // [GET] /users/not-friends
// module.exports.notFriend = async (req, res) => {
//   // Socket
//   usersocket(res);
//   // End Socket
//   const userId = res.locals.user.id;

//   const myUser = await User.findOne({
//     _id: userId,
//   });

//   const requestFriends = myUser.requestFriends;
//   const acceptFriends = myUser.acceptFriends;
//   const friendList = myUser.friendList;
//   const friendListId = myUser.friendList.map((item) => item.user_id);
//   const users = await User.find({
//     $and: [
//       { _id: { $ne: userId } },
//       { _id: { $nin: requestFriends } },
//       { _id: { $nin: acceptFriends } },
//       { _id: { $nin: friendListId } },
//     ],

//     status: "active",
//     deleted: false,
//   }).select("id avatar fullName");

//   res.render("client/pages/users/not-friend", {
//     pageTitle: "Danh sách người dùng",
//     users: users,
//   });
// };

// // [GET] /users/request
// module.exports.request = async (req, res) => {
//   // Socket
//   usersocket(res);
//   // End Socket
//   const userId = res.locals.user.id;

//   const myUser = await User.findOne({
//     _id: userId,
//   });

//   const requestFriends = myUser.requestFriends;
//   const users = await User.find({
//     _id: { $in: requestFriends },
//     status: "active",
//     deleted: false,
//   }).select("id avatar fullName");
//   res.render("client/pages/users/request", {
//     pageTitle: "Lời mời đã gửi",
//     users: users,
//   });
// };
// // [GET] /users/accept
// module.exports.accept = async (req, res) => {
//   // Socket
//   usersocket(res);
//   // End Socket
//   const userId = res.locals.user.id;

//   const myUser = await User.findOne({
//     _id: userId,
//   });

//   const acceptFriends = myUser.acceptFriends;

//   const users = await User.find({
//     _id: { $in: acceptFriends },
//     status: "active",
//     deleted: false,
//   }).select("id avatar fullName");

//   res.render("client/pages/users/accept", {
//     pageTitle: "Lời mời kết bạn",
//     users: users,
//   });
// };
const getRoleStyle = (roleId) => {
  const styles = {
    "66add3a77a10dbf90af339a2": {
      // Quản trị viên
      bg: "bg-purple-100",
      text: "text-purple-800",
      icon: "fas fa-shield-alt",
    },
    "679269bfbcae23ebfe88bf30": {
      // Nhà cung cấp
      bg: "bg-green-100",
      text: "text-green-800",
      icon: "fas fa-store",
    },
    "66add3ba7a10dbf90af339a5": {
      // Biên tập viên
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: "fas fa-edit",
    },
    "6717615aa508500fd819bcc1": {
      // Người viết blog
      bg: "bg-orange-100",
      text: "text-orange-800",
      icon: "fas fa-pencil-alt",
    },
  };
  return (
    styles[roleId] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      icon: "fas fa-user",
    }
  );
};
// [GET] /messages
module.exports.index = async (req, res) => {
  res.locals.getRoleStyle = getRoleStyle;
  const { search } = req.query;
  const filter = { deleted: false };

  if (search) {
    filter.$or = [
      { fullName: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
      { phone: new RegExp(search, "i") },
    ];
  }

  const total = await Account.countDocuments(filter);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 6,
    },
    req.query,
    total
  );

  const [accounts, roles] = await Promise.all([
    Account.find(filter)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip)
      .lean(),
    Role.find({ deleted: false }).lean(),
  ]);

  const roleMap = roles.reduce((acc, role) => {
    acc[role._id.toString()] = role;
    return acc;
  }, {});

  const user_Id = res.locals.user.id;
  const processedAccounts = await Promise.all(
    accounts.map(async (account) => {
      account.role = roleMap[account.role_id?.toString()] || null;

      const existingRoom = await RoomChat.findOne({
        typeRoom: "buyer-seller",
        "sellerBuyer.user_id": user_Id,
        "sellerBuyer.account_id": account._id,
      });

      if (!existingRoom) {
        const newRoom = await RoomChat.create({
          title: `Messager`,
          typeRoom: "buyer-seller",
          sellerBuyer: {
            user_id: user_Id,
            account_id: account._id,
          },
        });
        await newRoom.save();
        account.roomChatId = newRoom._id.toString();
      } else {
        account.roomChatId = existingRoom._id.toString();
      }

      return account;
    })
  );

  res.render("client/pages/users/friends", {
    pageTitle: "Nhắn tin",
    accounts,
    pagination: objectPagination,
    searchParams: { search },
  });
};
