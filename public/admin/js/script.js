// Button Status

const buttonStatus = document.querySelectorAll("[button-status]");

if (buttonStatus) {
  let url = new URL(window.location.href);
  buttonStatus.forEach((button) => {
    button.addEventListener("click", () => {
      const status = button.getAttribute("button-status");
      if (status) {
        url.searchParams.set("status", status);
      } else {
        url.searchParams.delete("status");
      }
      window.location.href = url.href;
    });
  });
}
// End Button Status

// Form search
const formSearch = document.querySelector("#form-search");
if (formSearch) {
  const url = new URL(window.location.href);
  formSearch.addEventListener("submit", (e) => {
    e.preventDefault();

    const keyword = e.target.elements.keyword.value;
    if (keyword) {
      url.searchParams.set("keyword", keyword);
    } else {
      url.searchParams.delete("keyword");
    }
    window.location.href = url.href;
    console.log(url);
  });
}
// end Form search

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

// Checkbox multi
const checkboxMulti = document.querySelector("[checkbox-multi]");
if (checkboxMulti) {
  const inputCheckAll = checkboxMulti.querySelector("input[name='checkall']");
  const inputsID = checkboxMulti.querySelectorAll("input[name='id']");
  inputCheckAll.addEventListener("click", () => {
    if (inputCheckAll.checked) {
      inputsID.forEach((input) => {
        input.checked = true;
      });
    } else {
      inputsID.forEach((input) => {
        input.checked = false;
      });
    }
  });

  inputsID.forEach((input) => {
    input.addEventListener("click", () => {
      const countChecked = checkboxMulti.querySelectorAll(
        "input[name='id']:checked"
      ).length;
      if (countChecked == inputsID.length) {
        inputCheckAll.checked = true;
      } else {
        inputCheckAll.checked = false;
      }
    });
  });
}
//End checkbox multi

// Form change multi
const formChangeMulti = document.querySelector("[form-change-multi]");
if (formChangeMulti) {
  formChangeMulti.addEventListener("submit", (e) => {
    e.preventDefault();
    const checkboxMulti = document.querySelector("[checkbox-multi]");
    const inputChecked = checkboxMulti.querySelectorAll(
      "input[name='id']:checked"
    );

    const typeChange = e.target.elements.type.value;

    if (typeChange == "delete-all") {
      const isConfirm = confirm("Bạn có chắc có muốn xóa không ?");
      if (!isConfirm) {
        return;
      }
    }
    if (typeChange == "--- Chọn hành động ---") {
      alert("Vui lòng chọn hành động");
      return;
    }
    if (inputChecked.length > 0) {
      let ids = [];
      inputChecked.forEach((input) => {
        const id = input.value;

        if (typeChange == "change-position") {
          const position = input
            .closest("tr")
            .querySelector("input[name='position']").value;
          ids.push(`${id}-${position}`);
        } else {
          ids.push(id);
        }
      });
      const inputIds = formChangeMulti.querySelector("input[name='ids']");
      inputIds.value = ids.join(",");
      formChangeMulti.submit();
    } else {
      alert("Vui lòng chọn ít nhất 1 bản ghi!");
    }
  });
}
// End Form change multi

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

// Upload
const uploadImage = document.querySelector("[upload-image]");
if (uploadImage) {
  const uploadImageInput = uploadImage.querySelector("[upload-image-input]");
  const uploadImagePreview = uploadImage.querySelector(
    "[upload-image-preview]"
  );
  const closeImagePreview = uploadImage.querySelector("[close-image-preview]");
  uploadImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    console.log(file);
    if (file) {
      uploadImagePreview.src = URL.createObjectURL(file);
      closeImagePreview.innerHTML = "x";
      closeImagePreview.classList.add("close-preview");

      closeImagePreview.addEventListener("click", () => {
        closeImagePreview.classList.remove("close-preview");
        closeImagePreview.innerHTML = "";
        uploadImagePreview.src = "";
        uploadImageInput.value = "";
      });
    }
  });
}
// end upload


// Sort
const sort = document.querySelector("[sort]");
if (sort) {
  const url = new URL(window.location.href);

  const sortSelect = sort.querySelector("[sort-select]");
  const sortClear = sort.querySelector("[sort-clear]");
  sortSelect.addEventListener("change", (e) => {
    const value = e.target.value;
    const [sortKey, sortValue] = value.split("-");

    url.searchParams.set("sortKey", sortKey);
    url.searchParams.set("sortValue", sortValue);

    window.location.href = url.href;
  });
  // Xoa Sap Xep
  sortClear.addEventListener("click", () => {
    url.searchParams.delete("sortKey");
    url.searchParams.delete("sortValue");
    window.location.href = url.href;
  });

  // Thêm selected cho option
  const sortKey = url.searchParams.get("sortKey");
  const sortValue = url.searchParams.get("sortValue");
  if (sortKey && sortValue) {
    const stringSort = `${sortKey}-${sortValue}`;
    const optionSelected = sortSelect.querySelector(
      `option[value=${stringSort}]`
    );
    optionSelected.selected = true;
  }
}
// End Sort

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menuToggle");
  const sider = document.querySelector("sider");
  const overlay = document.createElement("div");

  // Tạo overlay
  overlay.className =
    "fixed inset-0 bg-black/50 z-30 opacity-0 invisible transition-opacity duration-300";
  document.body.appendChild(overlay);

  // Xử lý toggle menu
  function toggleMenu() {
    sider.classList.toggle("hidden");
    overlay.classList.toggle("hidden");
  }

  menuToggle.addEventListener("click", toggleMenu);

  // Đóng menu khi click overlay
  overlay.addEventListener("click", toggleMenu);

  // Đóng menu khi click ra ngoài trên desktop
  document.addEventListener("click", (e) => {
    if (!sider.contains(e.target) && !menuToggle.contains(e.target)) {
      sider.classList.add("hidden");
      overlay.classList.add("hidden");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const blog = document.querySelector("[blog-table]");
  if(blog){
   if (document.querySelectorAll(".js-toggle-button")) {
    document.querySelectorAll(".js-toggle-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        const row = e.target.closest(".js-table-row");
        row.classList.toggle("is-open");

        const currentLevel = parseInt(row.dataset.level);
        let currentRow = row.nextElementSibling;

        while (currentRow) {
          const rowLevel = parseInt(currentRow.dataset.level);

          if (rowLevel > currentLevel) {
            currentRow.style.display = row.classList.contains("is-open")
              ? "table-row"
              : "none";
            currentRow = currentRow.nextElementSibling;
          } else {
            break;
          }
        }
      });
    });
  }

  if (document.querySelectorAll(".js-toggle-status")) {
    document.querySelectorAll(".js-toggle-status").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const id = e.currentTarget.dataset.id;
        const status =
          button.getAttribute("status") == "active" ? "inactive" : "active";
        try {
          const response = await fetch(
            `blog-category/change-status/${status}/${id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
              },
            }
          );

          window.location.reload();
        } catch (error) {
          console.error("Error:", error);
        }
      });
    });
  }

  // Delete item
  if (document.querySelectorAll(".js-delete-item")) {
    document.querySelectorAll(".js-delete-item").forEach((button) => {
      button.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm("Bạn có chắc chắn muốn xóa mục này?")) {
          fetch(`blog-category/delete/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
          }).then((response) => {
            window.location.reload();
          });
        }
      });
    });
  }
  }
  
const products = document.querySelector("[products-table]");
if (products) {
  if (document.querySelectorAll(".js-toggle-button")) {
    document.querySelectorAll(".js-toggle-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        const row = e.target.closest(".js-table-row");
        row.classList.toggle("is-open");

        const currentLevel = parseInt(row.dataset.level);
        let currentRow = row.nextElementSibling;

        while (currentRow) {
          const rowLevel = parseInt(currentRow.dataset.level);

          if (rowLevel > currentLevel) {
            currentRow.style.display = row.classList.contains("is-open")
              ? "table-row"
              : "none";
            currentRow = currentRow.nextElementSibling;
          } else {
            break;
          }
        }
      });
    });
  }

  if (document.querySelectorAll(".js-toggle-status")) {
    document.querySelectorAll(".js-toggle-status").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const id = e.currentTarget.dataset.id;
        const status =
          button.getAttribute("status") == "active" ? "inactive" : "active";
        try {
          const response = await fetch(
            `products-category/change-status/${status}/${id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
              },
            }
          );

          window.location.reload();
        } catch (error) {
          console.error("Error:", error);
        }
      });
    });
  }

  // Delete item
  if (document.querySelectorAll(".js-delete-item")) {
    document.querySelectorAll(".js-delete-item").forEach((button) => {
      button.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm("Bạn có chắc chắn muốn xóa mục này?")) {
          fetch(`products-category/delete/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
          }).then((response) => {
            window.location.reload();
          });
        }
      });
    });
  }
}
});

function handleImageUpload(uploader) {
  const input = uploader.querySelector("[upload-image-input]");
  const preview = uploader.querySelector("[upload-image-preview]");

  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.classList.remove("hidden");
        closeBtn.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    }
  });


}
if (document.querySelectorAll("[upload-image], [upload-image-cover]")){
  document
    .querySelectorAll("[upload-image], [upload-image-cover]")
    .forEach((uploader) => {
      handleImageUpload(uploader);
    });
}
