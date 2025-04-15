// Change status

const buttonChangeStatus = document.querySelectorAll("[button-change-status ]");
if (buttonChangeStatus) {
  const formChangeStatus = document.querySelector("#form-change-status");
  if (formChangeStatus) {
    const path = formChangeStatus.getAttribute("data-path");
    buttonChangeStatus.forEach((button) => {
      button.addEventListener("click", () => {
        const statusCurrent = button.getAttribute("data-status");
        const id = button.getAttribute("data-id");

        let statusChange = statusCurrent == "active" ? "inactive" : "active";
        console.log(statusCurrent, id);
        console.log(statusChange);

        const action = `${path}/${statusChange}/${id}?_method=PATCH`;
        console.log(action);
        formChangeStatus.action = action;
        formChangeStatus.submit();
      });
    });
  }
}

// End Change status

// Delete Item
const buttonDelete = document.querySelectorAll("[button-delete]");
if (buttonDelete.length > 0) {
  const formDeleteItem = document.querySelector("#form-delete-status");
  const path = formDeleteItem.getAttribute("data-path");
  buttonDelete.forEach((button) => {
    button.addEventListener("click", () => {
      const isConfirm = confirm("Bạn có chắc muốn xóa sản phẩm này");
      if (isConfirm) {
        const id = button.getAttribute("data-id");
        const action = `${path}/${id}?_method=DELETE`;
        console.log(action);
        formDeleteItem.action = action;
        formDeleteItem.submit();
      }
    });
  });
}
//End delete Item
// Thêm biến thể mới
function addVariant() {
  const container = document.getElementById('variants-container');
  const index = container.children.length;
  
  const template = `
    <div class="variant-item border p-4 rounded-lg">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-lg font-medium text-gray-700">Biến thể #${index + 1}</h3>
        <button type="button" class="text-red-500 hover:text-red-700" onclick="removeVariant(this)">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="space-y-3">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Tên biến thể (VD: Màu sắc)</label>
          <input 
            type="text" 
            name="variants[${index}][name]" 
            required 
            placeholder="Nhập tên biến thể"
            class="w-full px-3 py-2 border rounded-md"
          >
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Các giá trị</label>
          <div class="values-container space-y-2">
            ${createValueInput(index, 0)}
          </div>
          <button 
            type="button" 
            class="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
            onclick="addValue(this)"
          >
            Thêm giá trị
          </button>
        </div>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', template);
}

// Tạo input cho giá trị
function createValueInput(variantIndex, valueIndex) {
  return `
    <div class="value-item flex flex-wrap md:flex-nowrap items-center gap-2">
      <input 
        type="text" 
        name="variants[${variantIndex}][values][${valueIndex}][value]" 
        placeholder="Giá trị (VD: Đỏ)"
        required
        class="w-full md:w-auto flex-1 px-3 py-2 border rounded-md"
      >
      <input 
        type="number" 
        name="variants[${variantIndex}][values][${valueIndex}][stock]" 
        placeholder="Số lượng" 
        min="0" 
        required
        class="w-full md:w-28 px-3 py-2 border rounded-md"
      >
      <input 
        type="number" 
        name="variants[${variantIndex}][values][${valueIndex}][price]" 
        placeholder="Giá" 
        min="0" 
        required
        class="w-full md:w-28 px-3 py-2 border rounded-md"
      >
      <input 
        type="number" 
        name="variants[${variantIndex}][values][${valueIndex}][discountPercentage]" 
        placeholder="%Giảm giá" 
        min="0" 
        required
        class="w-full md:w-32 px-3 py-2 border rounded-md"
      >
      <input 
        type="number" 
        name="variants[${variantIndex}][values][${valueIndex}][thumbnailPosition]" 
        placeholder="Vị trí ảnh trong thumbnail" 
        min="0" 
        required
        class="w-full md:w-52 px-3 py-2 border rounded-md"
      >
      <button 
        type="button" 
        class="text-red-500 hover:text-red-700"
        onclick="removeValue(this)"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
}


// Xóa biến thể
function removeVariant(button) {
  button.closest('.variant-item').remove();
}

// Thêm giá trị mới
function addValue(button) {
  const container = button.previousElementSibling;
  const variantItem = button.closest('.variant-item');
  const variantIndex = Array.from(variantItem.parentElement.children).indexOf(variantItem);
  const valueIndex = container.children.length;
  
  container.insertAdjacentHTML('beforeend', createValueInput(variantIndex, valueIndex));
}

// Xóa giá trị
function removeValue(button) {
  button.closest('.value-item').remove();
}

// Xử lý preview ảnh
function previewImage(input) {
  const preview = document.getElementById('image-preview');
  const container = document.getElementById('preview-container');
  
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      container.classList.remove('hidden');
    }
    reader.readAsDataURL(input.files[0]);
  }
}

function removeImage() {
  document.getElementById('thumbnail').value = '';
  document.getElementById('image-preview').src = '';
  document.getElementById('preview-container').classList.add('hidden');
}
let uploadedFiles = [];

function handleFileSelect(input) {
  const errorElement = document.getElementById("file-error");
  errorElement.textContent = "";

  if (!input.files.length) return;

  const newFiles = Array.from(input.files);
  const invalidFiles = newFiles.filter(
    (file) => !file.type.startsWith("image/")
  );

  if (invalidFiles.length) {
    errorElement.textContent = "Chỉ được chọn file ảnh (JPEG, PNG, GIF)";
    input.value = "";
    return;
  }

  if (uploadedFiles.length + newFiles.length > 10) {
    errorElement.textContent = "Tối đa 10 ảnh được phép upload";
    input.value = "";
    return;
  }

  newFiles.forEach((file) => {
    uploadedFiles.push({
      id: URL.createObjectURL(file),
      file: file,
      timestamp: Date.now(),
    });
  });

  renderPreviews();
  updateFileInput();
}

function renderPreviews() {
  const container = document.getElementById("preview-container");
  const template = document.getElementById("preview-template");
const templateHTML = `
  <template id="preview-template">
    <div class="preview-item relative group overflow-hidden rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div class="absolute top-2 left-2 bg-gray-800 bg-opacity-75 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold index-number"></div>
      <img class="w-full h-40 object-cover" alt="Preview image">
      <button 
        type="button" 
        class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" 
        onclick="removeImage(this)" 
        title="Xóa ảnh">
        <i class="fas fa-times text-xs"></i>
      </button>
    </div>
  </template>
`;
  container.innerHTML = templateHTML;
  console.log(1)
  uploadedFiles.forEach((item, index) => {
    console.log(item)
    const clone = template.content.cloneNode(true);
    const img = clone.querySelector("img");
    const indexBadge = clone.querySelector(".index-number");
    const removeBtn = clone.querySelector("button");

    img.src = item.id;
    indexBadge.textContent = index;
    removeBtn.dataset.timestamp = item.timestamp;

    // Thêm hiệu ứng loading
    img.classList.add("animate-pulse");
    img.onload = () => img.classList.remove("animate-pulse");

    container.appendChild(clone);
    console.log('3')
  });
}

function removeImage(button) {
  const timestamp = parseInt(button.dataset.timestamp);
  const index = uploadedFiles.findIndex((item) => item.timestamp === timestamp);

  if (index > -1) {
    URL.revokeObjectURL(uploadedFiles[index].id);
    uploadedFiles.splice(index, 1);
    renderPreviews();
    updateFileInput();
  }
}

function updateFileInput() {
  const dataTransfer = new DataTransfer();
  uploadedFiles.forEach((item) => dataTransfer.items.add(item.file));
  document.getElementById("thumbnail").files = dataTransfer.files;
}
async function addImageFromUrl(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Failed to fetch image");

    const blob = await response.blob();
    const file = new File([blob], "downloaded_image.jpg", { type: blob.type });

    const objectURL = URL.createObjectURL(file);

    uploadedFiles.push({
      id: objectURL,
      file,
      timestamp: Date.now(),
    });

    setTimeout(() => URL.revokeObjectURL(objectURL), 30000);
  } catch (error) {
    console.error("Error downloading image:", error);
  }
}

const Edit = document.querySelector('[edit]')
if(Edit){
(async function () {
  const Edit = JSON.parse(document.querySelector("[edit]").value);
  if (Edit && Array.isArray(Edit)) {
    await Promise.all(Edit.map((e) => addImageFromUrl(e)));
    renderPreviews();
  }
})();
}

if (document.getElementById("productType")){
document.getElementById("productType").addEventListener("change", function () {
  const selectedType = this.value;
  const button = document.getElementById("addProductButton");
  console.log(selectedType)
  if (selectedType === "variant") {
    button.href = `products/create-variants`;
  } else {
    button.href = `products/create`;
  }
});
}

