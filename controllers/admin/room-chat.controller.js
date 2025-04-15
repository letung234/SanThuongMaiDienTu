const Room = require("../../models/rooms-chat.model");
const systemConfig = require("../../config/system");
const paginationHelper = require("../../helpers/pagination");
const Account = require("../../models/account.model");
//[GET] /admin/rooms

module.exports.index = async (req, res) => {
  try {
    const currentUser = res.locals.user;
    const keyword = req.query.keyword || "";

    let find = {
      deleted: false,
      typeRoom: "admin-group",
      "users.Account_id": currentUser._id.toString(),
    };

    // Xử lý tìm kiếm
    if (keyword) {
      const regex = new RegExp(keyword, "i");
      find.title = regex;
    }

    // Pagination
    const countRooms = await Room.countDocuments(find);

    let objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: 3,
      },
      req.query,
      countRooms
    );

    // Lấy danh sách phòng
    let records = await Room.find(find)
      .sort({ createdAt: -1 })
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    // Cập nhật avatar cho từng user trong room
    for (let room of records) {
      for (let user of room.users) {
        let account = await Account.findById(user.Account_id).select("avatar");
        if (account) {
          user.avatar = account.avatar;
        }
      }
    }

    res.render("admin/pages/rooms/index", {
      pageTitle: "Nhóm Chat Admin",
      records: records,
      keyword: keyword,
      pagination: objectPagination,
      a: currentUser,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phòng:", error);
    res.status(500).send("Lỗi máy chủ");
  }
};

// [GET] /admin/rooms/create
module.exports.create = async (req, res) => {
  try {
    const currentUser = res.locals.user;
    const accounts = await Account.find({
      deleted: false,
      _id: { $ne: currentUser._id },
    }).select("_id fullName avatar");

    res.render("admin/pages/rooms/create", {
      pageTitle: "Tạo nhóm mới",
      accounts: accounts,
    });
  } catch (error) {
    res.redirect("back");
  }
};

// [POST] /admin/rooms/create
module.exports.createPost = async (req, res) => {
  try {
    const currentUser = res.locals.user;
    let { title, avatar, status, members } = req.body;
    if (!Array.isArray(members)) {
      members = members.split(",").map((member) => member.trim());
    } 

    const newRoom = new Room({
      title: title,
      avatar: avatar,
      typeRoom: "admin-group",
      status: status,
      users: [
        {
          Account_id: currentUser._id.toString(),
          role: "admin",
        },
        ...members.map((member) => ({
          Account_id: member,
          role: "member",
        })),
      ],
    });

    await newRoom.save();
    req.flash("success", "Tạo nhóm thành công!");
    res.redirect(`${systemConfig.prefixAdmin}/rooms`);
  } catch (error) {
    console.log(error)
    req.flash("error", "Tạo nhóm thất bại!");
    res.redirect("back");
  }
};
// [GET] /admin/rooms/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const currentUser = res.locals.user;

    const room = await Room.findOne({
      _id: id,
      deleted: false,
      "users.Account_id": currentUser._id.toString(),
      "users.role": "admin",
    });

    const allAccounts = await Account.find({ deleted: false }).select(
      "_id fullName avatar"
    );

    const currentMembers = [];
    for (const user of room.users) {
      for (const account of allAccounts) {
        if (user.Account_id === account._id.toString()) {
          currentMembers.push({
            ...user.toObject(),
            accountInfo: {
              _id: account._id,
              fullName: account.fullName,
              avatar: account.avatar,
            },
          });
          break;
        }
      }
    }

    // Lọc thành viên không có trong phòng
    const nonMembers = allAccounts.filter(
      (account) =>
        !room.users.some((user) => user.Account_id === account._id.toString())
    );

    res.render("admin/pages/rooms/edit", {
      pageTitle: "Chỉnh sửa nhóm",
      room: room,
      currentMembers: currentMembers,
      nonMembers: nonMembers,
    });
  } catch (error) {
    req.flash("error", "Lỗi truy cập!");
    res.redirect("back");
  }
};

// [PATCH] /admin/rooms/edit/:id
module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    let {
      title,
      avatar,
      status,
      membersToAdd = [],
      membersToRemove = [],
    } = req.body;
   if (!Array.isArray(membersToAdd)) {
     membersToAdd = membersToAdd.split(",").map((member) => member.trim());
   } 
   if (!Array.isArray(membersToRemove)) {
     membersToRemove = membersToRemove.split(",").map((member) => member.trim());
   } 
    // Xử lý xóa thành viên
    if (membersToRemove.length > 0) {
      await Room.updateOne(
        { _id: id },
        {
          $pull: {
            users: {
              Account_id: { $in: membersToRemove },
            },
          },
        }
      );
    }

    if (membersToAdd.length > 0) {
      const newMembers = membersToAdd.map((member) => ({
        Account_id: member,
        role: "member",
      }));

      await Room.updateOne(
        { _id: id },
        {
          $push: {
            users: {
              $each: newMembers,
            },
          },
        }
      );
    }

    await Room.updateOne(
      { _id: id },
      {
        title: title,
        avatar: avatar,
        status: status,
      }
    );

    req.flash("success", "Cập nhật nhóm thành công!");
    res.redirect(`${systemConfig.prefixAdmin}/rooms`);
  } catch (error) {
    console.log(error)
    req.flash("error", "Cập nhật thất bại!");
    res.redirect("back");
  }
};
// [DELETE] /admin/rooms/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const currentUser = res.locals.user;

    await Room.updateOne(
      {
        _id: id,
        "users.Account_id": currentUser._id.toString(),
        "users.role": "admin",
      },
      {
        deleted: true,
        deletedAt: new Date(),
      }
    );

    req.flash("success", "Xóa nhóm thành công!");
    res.json({ success: true });
  } catch (error) {
    req.flash("error", "Xóa nhóm thất bại!");
    res.status(500).json({ success: false });
  }
};

// [GET] /admin/rooms/chat
module.exports.chat = async (req, res) => {
  const currentUser = res.locals.user;
  const { keyword } = req.query;

  const pipeline = [
    {
      $match: {
        typeRoom: "buyer-seller",
        "sellerBuyer.account_id": currentUser._id.toString(),
        deleted: false,
      },
    },
    {
      $lookup: {
        from: "chats",
        let: { roomId: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$room_chat_id", "$$roomId"] },
            },
          },
          { $sort: { createdAt: -1 } },
        ],
        as: "messages",
      },
    },
    {
      $match: {
        "messages.0": { $exists: true },
      },
    },
    {
      $lookup: {
        from: "users",
        let: { userId: { $toObjectId: "$sellerBuyer.user_id" } },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$userId"] },
            },
          },
        ],
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
    {
      $project: {
        "userInfo._id": 1,
        "userInfo.fullName": 1,
        "userInfo.avatar": 1,
        "userInfo.statusOnline": 1,
        lastMessage: {
          $ifNull: [{ $arrayElemAt: ["$messages.content", 0] }, null],
        },
        unreadCount: {
          $size: {
            $filter: {
              input: "$messages",
              as: "msg",
              cond: { $eq: ["$$msg.deleted", false] },
            },
          },
        },
      },
    },
  ];

  if (keyword) {
    pipeline.push({
      $match: {
        "userInfo.fullName": {
          $regex: new RegExp(
            keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i"
          ),
        },
      },
    });
  }

  const rooms = await Room.aggregate(pipeline);
console.log(rooms);
  res.render("admin/pages/rooms/chat", {
    pageTitle: "Chat với khách hàng",
    customers: rooms,
  });
};
