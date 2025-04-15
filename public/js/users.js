// // Chức năng gửi yêu cầu
// const listBtnAddFriend = document.querySelectorAll("[btn-add-friend]");
// if (listBtnAddFriend.length > 0) {
//   listBtnAddFriend.forEach((button) => {
//     button.addEventListener("click", (e) => {
//       const userId = button.getAttribute("btn-add-friend");
//       button.closest(".box-user").classList.add("add");
//       // console.log(userId);

//       socket.emit("CLIENT_ADD_FRIEND", userId);
//     });
//   });
// }
// // Hết chức năng gửi yêu cầu
// // Chức năng hủy gửi yêu cầu

// const listBtnCancelFriend = document.querySelectorAll("[btn-cancel-friend]");
// if (listBtnCancelFriend.length > 0) {
//   listBtnCancelFriend.forEach((button) => {
//     button.addEventListener("click", (e) => {
//       const userId = button.getAttribute("btn-cancel-friend");
//       button.closest(".box-user").classList.remove("add");
//       // console.log(userId);

//       socket.emit("CLIENT_CANCEL_FRIEND", userId);
//     });
//   });
// }
// // Hết chức năng hủy gửi yêu cầu

// // Chức năng từ chối kết bạn
// const refuseFriend = (button) => {
//   button.addEventListener("click", (e) => {
//     const userId = button.getAttribute("btn-refuse-friend");
//     button.closest(".box-user").classList.add("refuse");

//     socket.emit("CLIENT_REFUSE_FRIEND", userId);
//   });
// };
// const listBtnRefuseFriend = document.querySelectorAll("[btn-refuse-friend]");
// if (listBtnRefuseFriend.length > 0) {
//   listBtnRefuseFriend.forEach((button) => {
//     refuseFriend(button);
//   });
// }
// // Hết chức năng từ chối kết bạn

// // Chức năng chấp nhận kết bạn
// const acceptFriend = (button) => {
//   button.addEventListener("click", (e) => {
//     const userId = button.getAttribute("btn-accept-friend");
//     button.closest(".box-user").classList.add("accepted");
//     // console.log(userId);

//     socket.emit("CLIENT_ACCEPT_FRIEND", userId);
//   });
// };

// const listBtnAcceptFriend = document.querySelectorAll("[btn-accept-friend]");
// if (listBtnAcceptFriend.length > 0) {
//   listBtnAcceptFriend.forEach((button) => {
//     acceptFriend(button);
//   });
// }
// // Hết chức năng chấp nhận kết bạn

// // SERVER_RETURN_LENGTH_ACCEPT_FRIEND
// const badgeUserAccept = document.querySelector("[badge-users-accept]");
// if (badgeUserAccept) {
//   const userId = badgeUserAccept.getAttribute("badge-users-accept");
//   socket.on("SERVER_RETURN_LENGTH_ACCEPT_FRIEND", (data) => {
//     // console.log(data);
//     if (userId === data.userId) {
//       badgeUserAccept.innerHTML = data.lengthAcceptFriends;
//     }
//   });
// }

// // END SERVER_RETURN_LENGTH_ACCEPT_FRIEND

// // SERVER_RETURN_INFO_ACCEPT_FRIEND
// socket.on("SERVER_RETURN_INFO_ACCEPT_FRIEND", (data) => {
//   const dataUsersAccept = document.querySelector("[data-users-accept]");
//   //Trang lời mời đã nhận
//   if (dataUsersAccept) {
//     const userId = dataUsersAccept.getAttribute("data-users-accept");
//     if (userId === data.userId) {
//       // Vẽ user ra giao diện
//       const div = document.createElement("div");
//       div.classList.add("col-6");
//       div.setAttribute("user-id", data.infoUserA._id);

//       div.innerHTML = `
//         <div class="box-user">
//           <div class="inner-avatar">
//             <img src="/image/user.png" alt="${data.infoUserA.fullName}">
//           </div>
//           <div class="inner-info">
//             <div class="inner-name">${data.infoUserA.fullName}</div>
//             <div class="inner-buttons">
//                 <button 
//                   class="btn btn-sm btn-primary mr-1" 
//                   btn-accept-friend="${data.infoUserA._id}">Chấp nhận
//                 </button>
//                 <button 
//                   class="btn btn-sm btn-secondary mr-1" 
//                   btn-refuse-friend="${data.infoUserA._id}">Xóa
//                 </button>
//                 <button 
//                   class="btn btn-sm btn-secondary mr-1"
//                   btn-deleted-friend="" disabled="">Đã xóa
//                 </button>
//                 <button 
//                   class="btn btn-sm btn-primary mr-1" 
//                   btn-accepted-friend="" disabled="">Đã chấp nhận
//                 </button>
//             </div>
//           </div>
//         </div>
//       `;
//       dataUsersAccept.appendChild(div);
//       // Hết Vẽ user ra giao diện

//       // Hủy lời mời kết bạn
//       const buttonRefuse = div.querySelector("[btn-refuse-friend]");
//       refuseFriend(buttonRefuse);
//       // Hết Hủy lời mời kết bạn

//       // Chấp nhận lời mời kết bạn
//       const buttonAccept = div.querySelector("[btn-accept-friend]");
//       acceptFriend(buttonAccept);
//       // Hết chấp nhận lời mời kết bạn
//     }
//   }

//   // Trang danh sách người dùng
//   const dataUserNotFriend = document.querySelector("[data-users-not-friend]");
//   if (dataUserNotFriend) {
//     const userId = dataUserNotFriend.getAttribute("data-users-not-friend");
//     if (userId === data.userId) {
//       const boxUserRemove = dataUserNotFriend.querySelector(`[user-id='${data.infoUserA._id}']`);
//       if (boxUserRemove) {
//           dataUserNotFriend.removeChild(boxUserRemove);
//       }
//     }
//   }
// });

// // END SERVER_RETURN_INFO_ACCEPT_FRIEND
// // SERVER_RETURN_USER_ID_FRIEND;
// socket.on("SERVER_RETURN_USER_ID_CANCEL_FRIEND", (data) => {
//   const boxUserRemove = document.querySelector(`[user-id='${data.userIdA}']`);
//   if (boxUserRemove) {
//     const dataUserAccept = document.querySelector("[data-users-accept]");
//     const userIdB = badgeUserAccept.getAttribute("badge-users-accept");
//     if (userIdB === data.userIdB) {
//       dataUserAccept.removeChild(boxUserRemove);
//     }
//   }
// });
// // END SERVER_RETURN_USER_ID_FRIEND;

// // SERVER_RETURN_USER_STATUS_ONLINE
// socket.on("SERVER_RETURN_USER_STATUS_ONLINE", (data) => {
//   const dataUsersFriend = document.querySelector("[data-users-friend]");
//   if(dataUsersFriend) {
//     const boxUser = dataUsersFriend.querySelector(`[user-id="${data.userId}"]`);
//     if(boxUser) {
//       const boxStatus = boxUser.querySelector("[status]");
//       boxStatus.setAttribute("status", data.status);
//     }
//   }
// });
// // End SERVER_RETURN_USER_STATUS_ONLINE


// // SERVER_RETURN_USER_ID_ACCEPT_FRIEND
// const DATA_REQUEST = document.querySelector("[data-request]");
// if (DATA_REQUEST) {
//   socket.on("SERVER_RETURN_USER_ID_ACCEPT_FRIEND", (data) => {
//     const userId = DATA_REQUEST.querySelector(`[user-id="${data.userId}"]`);
//     if (userId) {
//       userId.classList.add("fade-out"); // Thêm lớp tạo hiệu ứng mờ dần
//       setTimeout(() => {
//         userId.remove(); // Xóa phần tử sau 0.5s (thời gian của transition)
//       }, 500); // Đặt thời gian timeout khớp với thời gian của transition
//     }
//   });
// }

// // END SERVER_RETURN_USER_ID_ACCEPT_FRIEND