// Show alert
const showAlert = document.querySelector("[show-alert]");
if (showAlert) {
  const time = parseInt(showAlert.getAttribute("data-time"));
  console.log(showAlert);
  setTimeout(() => {
    showAlert.classList.add("alert-hidden");
  }, time);
  const closeAlert = showAlert.querySelector("[close-alert]");
  closeAlert.addEventListener("click", () => {
    showAlert.classList.add("alert-hidden");
  });
}
// End Show alert

// Detect a Browser or Tab Close Event in JavaScript
// window.addEventListener("beforeunload", (event) => {
//   event.preventDefault();
//   socket.emit("CLIENT_CLOSE_WEB","TEST");
//   console.log("đã tắt web");
//   event.returnValue = "";
// });

const sliderWrapper = document.querySelector(".slider-wrapper");
const prevButton = document.querySelector(".prev");
const nextButton = document.querySelector(".next");
const dots = document.querySelectorAll("#product-category-slider [data-index]");
if (sliderWrapper && prevButton && nextButton && dots) {
  let currentIndex = 0;
  const items = sliderWrapper.children;
  const itemWidth = items[0].offsetWidth + 24;

  const updateSliderPosition = () => {
    sliderWrapper.style.transform = `translateX(-${
      currentIndex * itemWidth
    }px)`;
    updateDots();
  };

  const updateDots = () => {
    dots.forEach((dot, index) => {
      if (index == currentIndex) {
        dot.classList.add("bg-gray-800");
        dot.classList.remove("bg-white/30");
      } else {
        dot.classList.add("bg-white/30");
        dot.classList.remove("bg-gray-800");
      }
    });
  };

  prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateSliderPosition();
    }
  });

  nextButton.addEventListener("click", () => {
    if (
      currentIndex <
      items.length - Math.floor(sliderWrapper.offsetWidth / itemWidth)
    ) {
      currentIndex++;
      updateSliderPosition();
    }
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentIndex = index;
      updateSliderPosition();
    });
  });

  updateDots();
}

// Toggle Mobile Menu
const mobileMenuButton = document.getElementById("mobileMenuButton");
const mobileMenu = document.getElementById("mobileMenu");

mobileMenuButton.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});

const userMenuButton = document.getElementById("userMenuButton");
const userDropdown = document.getElementById("userDropdown");
if (userMenuButton && userDropdown) {
  userMenuButton.addEventListener("click", () => {
    userDropdown.classList.toggle("hidden");
  });

  // Đóng dropdown khi click ra ngoài
  document.addEventListener("click", (event) => {
    if (
      !userMenuButton.contains(event.target) &&
      !userDropdown.contains(event.target)
    ) {
      userDropdown.classList.add("hidden");
    }
  });
}

// Thêm vào giỏ hàng
const addToCartButtons = document.querySelectorAll(".add-to-cart");
if (addToCartButtons) {
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id");
    });
  });
}

// pagination
const buttonsPagination = document.querySelectorAll("[button-pagination]");
if (buttonsPagination) {
  const url = new URL(window.location.href);
  buttonsPagination.forEach((button) => {
    button.addEventListener("click", (e) => {
      const page = button.getAttribute("button-pagination");

      url.searchParams.set("page", page);
      window.location.href = url.href;
    });
  });
}
// End pagination
if (document.getElementById("add-to-cart-btn")) {
  document
    .getElementById("add-to-cart-btn")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      const product = JSON.parse(
        document
          .querySelector("[productServerData]")
          .getAttribute("productServerData")
      );
      const quantity = parseInt(document.getElementById("quantityInput").value);
      let selectedVariants = {}
      let price, discount, stock;

      if (product.variants.length > 0) {
        const activeOptions = document.querySelector(
          ".variant-option.bg-indigo-100.text-indigo-900.ring-2.ring-indigo-300"
        );

        if (!activeOptions) {
          Toastify({
            text: `
              <div class="flex justify-between items-center">
                <span>Vui lòng chọn đầy đủ các tùy chọn biến thể</span>
              </div>
            `,
            duration: 3000,
            gravity: "top",
            position: "right",
            escapeMarkup: false,
            style: { background: "#ff9800" },
            onClick: function () {
              this.hideToast();
            },
          }).showToast();
          return;
        }

        const variantName = activeOptions
          .closest("div.space-y-2")
          .querySelector("h4")
          .textContent.trim();

        selectedVariants = {
          name: variantName,
          value: activeOptions.textContent.trim(),
        };

        const lastOption = activeOptions;
        price = parseFloat(lastOption.dataset.price);
        discount = parseFloat(lastOption.dataset.discount);
        stock = parseInt(lastOption.dataset.stock);
      } else {
        price = product.price;
        discount = product.discountPercentage;
        stock = product.stock;
      }

      if (quantity < 1 || quantity > stock) {
        Toastify({
          text: `
            <div class="flex justify-between items-center">
              <span>Số lượng phải từ 1 đến ${stock}</span>
            </div>
          `,
          duration: 3000,
          gravity: "top",
          position: "right",
          escapeMarkup: false,
          style: { background: "#ff5252" },
          onClick: function () {
            this.hideToast();
          },
        }).showToast();
        return;
      }

      const payload = {
        productId: product._id,
        quantity,
        price: discount > 0 ? price * (1 - discount / 100) : price,
        discount,
        variants: selectedVariants,
      };
      console.log(payload)
      try {
        const response = await fetch(`/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Server trả về lỗi: ${text.substring(0, 100)}`);
        }

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Lỗi không xác định");
        }

        Toastify({
          text: `
            <div class="flex justify-between items-center">
              <span>${result.message}</span>
            </div>
          `,
          duration: 3000,
          gravity: "top",
          position: "right",
          escapeMarkup: false,
          style: { background: "#4caf50" },
          onClick: function () {
            this.hideToast();
          },
        }).showToast();

        if (result.cartCount) {
          document.querySelector(".cart-count").textContent = result.cartCount;
        }
      } catch (error) {
        console.error("Lỗi:", error);
        Toastify({
          text: `
            <div class="flex justify-between items-center">
              <span>${error.message || "Lỗi khi thêm vào giỏ hàng"}</span>
            </div>
          `,
          duration: 3000,
          gravity: "top",
          position: "right",
          escapeMarkup: false,
          style: { background: "#ff5252" },
          onClick: function () {
            this.hideToast();
          },
        }).showToast();
      }
    });
}

