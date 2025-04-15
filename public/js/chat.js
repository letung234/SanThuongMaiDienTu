import * as Popper from "https://cdn.jsdelivr.net/npm/@popperjs/core@^2/dist/esm/index.js";
import { FileUploadWithPreview } from "https://unpkg.com/file-upload-with-preview/dist/index.js";
import { Spinner } from "https://cdn.jsdelivr.net/npm/spin.js@4.1.1/spin.min.js";
// Khởi tạo FileUploadWithPreview
const upload = new FileUploadWithPreview("upload-images", {
  multiple: true,
});

// CLIENT_SEND_MESSAGE
const forSendData = document.querySelector(".chat .inner-form");
if (forSendData) {
  forSendData.addEventListener("submit", (e) => {
    e.preventDefault();
    socket.emit("CLIENT_SEND_TYPING", "hidden");
    document.querySelector(".loader").classList.remove("hidden");
    const content = e.target.elements.content.value;
    const images = upload.cachedFileArray;

    if (content || images.length > 0) {
      // Gửi tin nhắn
      socket.emit("CLIENT_SEND_MESSAGE", {
        content: content,
        images: images,
      });


      

      // Xóa nội dung đã nhập và reset preview panel
      e.target.elements.content.value = "";
      upload.resetPreviewPanel();
      
    }
  });
}
// End CLIENT_SEND_MESSAGE

// SERVER_RETURN_MESSAGE
socket.on("SERVER_RETURN_MESSAGE", (data) => {
  const myUserId = document
    .querySelector("[my-user-id]")
    ?.getAttribute("my-user-id");
  const myAccountId = document
    .querySelector("[my-account-id]")
    ?.getAttribute("my-account-id");

  const isMyMessage =
    (data.senderType === "user" && data.senderId === myUserId) ||
    (data.senderType === "account" && data.senderId === myAccountId);
    console.log(isMyMessage);
  const body = document.querySelector(".chat .inner-body");
  const boxTyping = document.querySelector(".chat .inner-list-typing");
  const div = document.createElement("div");
  let htmlFullName = "";
  let htmlContent = "";
  let htmlImages = "";

  if (isMyMessage) {
    
    div.classList.add("inner-outgoing", "grid", "justify-end");
  } else {
    
    htmlFullName = `
    <div class="flex items-center gap-1 w-auto py-1">
    <div class="inner-avatar">
  <img  src="${encodeURI(data.avatar)}" alt="Avatar" />
  </div>
  <div class="inner-name min-w-40">${data.fullName}</div>
  </div>
`;

    div.classList.add("inner-incoming");
  }
  
  if (data.content) {
    htmlContent = `
      <div class="inner-content">${data.content}</div>
    `;
  }
  if (data.images.length > 0) {
    htmlImages += `<div class="inner-images"> `;
    for (const image of data.images) {
      htmlImages += `<img src="${image}"/>`;
    }

    htmlImages += `</div>`;
  }

  div.innerHTML = `
    ${htmlFullName}
    ${htmlContent}
    ${htmlImages}
  `;
  document.querySelector(".loader").classList.add("hidden");
  body.insertBefore(div, boxTyping);
  body.scrollTop = body.scrollHeight;



});
// END SERVER_RETURN_MESSAGE

// Scroll Chat To Bottom
const bodyChat = document.querySelector(".chat .inner-body");
if (bodyChat) {
  bodyChat.scrollTop = bodyChat.scrollHeight;
}
// End Scroll Chat To Bottom

// Show Icon Chat

// Show Popup
const buttonIcon = document.querySelector(".button-icon");
if (buttonIcon) {
  const tooltip = document.querySelector(".tooltip");
  Popper.createPopper(buttonIcon, tooltip);

  buttonIcon.addEventListener("click", (e) => {
    tooltip.classList.toggle("shown");
  });
}

// Show Popup
//Show Typing
var timeOut;
const showTyping = () => {
  socket.emit("CLIENT_SEND_TYPING", "show");

  clearTimeout(timeOut);
  timeOut = setTimeout(() => {
    socket.emit("CLIENT_SEND_TYPING", "hidden");
  }, 3000);
};
//End show Typing

// Insert Icon to input

const emojiPicker = document.querySelector("emoji-picker");
const inputChat = document.querySelector(
  ".chat .inner-form input[name='content']"
);
if (emojiPicker) {
  emojiPicker.addEventListener("emoji-click", (e) => {
    const icon = e.detail.unicode;
    inputChat.value = inputChat.value + icon;
    const end = inputChat.value.length;
    inputChat.setSelectionRange(end, end);
    inputChat.focus();

    showTyping();
  });
}
// Input Keyup
inputChat.addEventListener("keyup", () => {
  showTyping();
});
// End Input Keyup

// End insert Icon to Input
// End Show Icon Chat

const elementListTyping = document.querySelector(".chat .inner-list-typing");
// SERVER_RETURN_TYPING
if (elementListTyping) {
  socket.on("SERVER_RETURN_TYPING", (data) => {
    if (data.type === "show") {
      
      const existTyping = elementListTyping.querySelector(
        `[user-id="${data.userId}"]`
      );
      const bodyChat = document.querySelector(".chat .inner-body");

      if (!existTyping) {
        const boxTyping = document.createElement("div");
        boxTyping.classList.add("box-typing");
        boxTyping.setAttribute("user-id", data.userId);
        boxTyping.innerHTML = `
         <div class="inner-avatar">
  <img  src="${encodeURI(data.avatar)}" alt="Avatar" />
  </div>
        <div class="inner-name">${data.fullName}</div>
        <div class="inner-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
       `;
        elementListTyping.appendChild(boxTyping);
        bodyChat.scrollTop = bodyChat.scrollHeight;
      }
    } else {
      const boxTypingRemove = elementListTyping.querySelector(
        `[user-id="${data.userId}"]`
      );
      if (boxTypingRemove) {
        elementListTyping.removeChild(boxTypingRemove);
      }
    }
  });
}


// PREVIEW FULL IMAGE
const bodyChatPreviewImage = document.querySelector(".chat .inner-body");

if (bodyChatPreviewImage) {
  const gallery = new Viewer(bodyChatPreviewImage);
}

// END PREVIEW FULL IMAGE

// // DELETE MESSAGE
// const bodyChatDelete = document.querySelector(".chat .inner-body");
// if (bodyChatDelete) {
//   bodyChatDelete.addEventListener("contextmenu", (e) => {
//     e.preventDefault();
//     const targetChat = e.target.closest("[chatid]");

//     if (targetChat) {
//       const chatId = targetChat.getAttribute("chatid");
//       console.log(chatId);
//       const buttondelete = targetChat.querySelector("[buttondelete]");
//       const buttonrevoke = targetChat.querySelector("[buttonrevoke]");
//       const contextMenu = targetChat.querySelector(".context-menu");
//       if (contextMenu) {
//         contextMenu.style.top = `${e.clientY}px`;
//         contextMenu.style.left = `${e.clientX}px`;
//         contextMenu.style.display = "block";
//         contextMenu.style.zIndex = "9999999";
//         const deleteHandler = async () => {
//           try {
//             const response = await fetch(
//               `http://localhost:3000/chat/delete/${chatId}`,
//               { method: "DELETE" }
//             );

//             if (response.ok) {
//               // Xóa phần tử chat khỏi DOM
//               const chatElement = bodyChatDelete.querySelector(
//                 `[chatid="${chatId}"]`
//               );
//               if (chatElement) {
//                 chatElement.remove();
//               }
//               console.log("Deleted chat successfully");
//             } else {
//               console.error("Failed to delete chat, response:", response);
//             }
//           } catch (error) {
//             console.error("Failed to delete chat:", error);
//           }
//         };

//         buttondelete.addEventListener("click", async () => {
//           await deleteHandler();
//           console.log("Deleted chat successfully");
//         });
//         // click ra ngoài thì sẽ ẩn đi
//         document.addEventListener("click", function handleClickOutside(event) {
//           if (!targetChat.contains(event.target)) {
//             contextMenu.style.display = "none";
//             document.removeEventListener("click", handleClickOutside);
//           }
//         });
//       }
//     }
//   });
// }
// // END DELETE MASSAGE

// // DOM Elements
// const chatForm = document.getElementById('chat-form');
// const messageInput = document.getElementById('message-input');
// const chatBody = document.getElementById('chat-body');
// const emojiPicker = document.getElementById('emoji-picker');
// const typingTimeout = 3000;
// let lastTypingTime = Date.now();

// // Xử lý gửi tin nhắn
// chatForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const content = e.target.elements.content.value;
//     const images = upload.cachedFileArray;

//     if (content || images.length > 0) {
//       // Gửi tin nhắn
//       socket.emit("CLIENT_SEND_MESSAGE", {
//         content: content,
//         images: images,
//       });


//       var opts = {
//         lines: 12,
//         length: 7,
//         width: 5,
//         radius: 10,
//         scale: 0.5,
//         corners: 1,
//         color: "#007bff",
//         fadeColor: "transparent",
//         animation: "spinner-line-fade-more",
//         rotate: 0,
//         direction: 1,
//         speed: 2, 
//         zIndex: 2000000000,
//         className: "spinner",
//         top: "50%",
//         left: "50%",
//         shadow: "0 0 1px transparent",
//         position: "absolute",
//       };

//       // Tạo spinner và gắn vào phần tử #spin-container
//       const target = document.getElementById("spin-container");
//       spinnerInstance = new Spinner(opts).spin(target);

//       // Xóa nội dung đã nhập và reset preview panel
//       e.target.elements.content.value = "";
//       upload.resetPreviewPanel(); // Xóa các hình ảnh đã chọn
//       socket.emit("CLIENT_SEND_TYPING", false);
//     }
 
// });

// // Socket.IO Handlers
// socket.on('SERVER_RETURN_MESSAGE', (message) => {
//   const isCurrentUser = (message.senderType === 'user' && message.senderId === currentUser?._id) || 
//                        (message.senderType === 'account' && message.senderId === currentAccount?._id);

//   const messageElement = document.createElement('div');
//   messageElement.className = `flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`;

//   let imagesHTML = '';
//   if (message.images && message.images.length > 0) {
//     imagesHTML = `
//       <div class="grid grid-cols-2 gap-2 mt-2">
//         ${message.images.map(img => `
//           <img 
//             src="${img}" 
//             class="rounded-lg object-cover w-full h-32 cursor-pointer"
//             onclick="viewImage('${img}')"
//           >
//         `).join('')}
//       </div>
//     `;
//   }

//   messageElement.innerHTML = `
//     <div class="max-w-md p-3 rounded-lg ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100'}">
//       ${!isCurrentUser ? `
//         <div class="flex items-center mb-2">
//           <img src="${message.avatar || '/images/default-avatar.jpg'}" 
//                class="w-6 h-6 rounded-full mr-2">
//           <span class="font-semibold text-sm">${message.fullName}</span>
//         </div>
//       ` : ''}
//       ${message.content ? `<p class="text-sm whitespace-pre-wrap">${message.content}</p>` : ''}
//       ${imagesHTML}
//     </div>
//   `;

//   chatBody.appendChild(messageElement);
//   scrollToBottom();
// });

// let typing = false;

// messageInput.addEventListener('input', () => {
//   const now = Date.now();
//   const timeSinceLastTyping = now - lastTypingTime;
  
//   if (!typing && timeSinceLastTyping > typingTimeout) {
//     typing = true;
//     socket.emit('CLIENT_SEND_TYPING', true);
//   }
  
//   lastTypingTime = now;
  
//   if (typing) {
//     setTimeout(() => {
//       const timeSinceLastTyping = Date.now() - lastTypingTime
//       if (timeSinceLastTyping >= typingTimeout && typing) {
//         typing = false
//         socket.emit('CLIENT_SEND_TYPING', false)
//       }
//     }, typingTimeout)
//   }
// });

// socket.on('SERVER_RETURN_TYPING', (data) => {
//   const typingIndicators = document.getElementById('typing-indicators');
//   const existingIndicator = document.getElementById(`typing-${data.senderId}`);

//   if (data.typing) {
//     if (!existingIndicator) {
//       const indicator = document.createElement('div');
//       indicator.id = `typing-${data.senderId}`;
//       indicator.className = 'flex items-center text-gray-500 text-sm';
//       indicator.innerHTML = `
//         <img src="${data.avatar}" class="w-5 h-5 rounded-full mr-2">
//         <span>${data.fullName} đang soạn tin...</span>
//         <div class="ml-2 flex space-x-1">
//           <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//           <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
//           <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
//         </div>
//       `;
//       typingIndicators.appendChild(indicator);
//     }
//   } else {
//     if (existingIndicator) {
//       existingIndicator.remove();
//     }
//   }
// });

// // Utility Functions
// function scrollToBottom() {
//   chatBody.scrollTop = chatBody.scrollHeight;
// }

// // Emoji Picker
// document.addEventListener('click', (e) => {
//   if (!e.target.closest('#emoji-picker') && !e.target.matches('#message-input')) {
//     emojiPicker.classList.add('hidden');
//   }
// });

// messageInput.addEventListener('focus', () => {
//   emojiPicker.classList.remove('hidden');
// });

// new EmojiPicker({
//   trigger: '#message-input',
//   container: '#emoji-picker',
//   insertTo: '#message-input'
// });

// // Initial scroll to bottom
// scrollToBottom();

