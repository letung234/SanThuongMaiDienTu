// Cập nhật lại số lượng trong giỏ hàng

const inputQuantity = document.querySelectorAll("input[name='quantity']");
if(inputQuantity.length > 0){
   inputQuantity.forEach(input =>{
      input.addEventListener("change", () => {
         const productId = input.getAttribute("product-id");
         const quantity = input.value;

         console.log(productId);
         window.location.href = `/cart/update/${productId}/${quantity}`;
      })
   });
}
// Hết Cập nhật lại số lượng trong giỏ hàng

// Xử lý sự kiện thay đổi số lượng
document.querySelectorAll('input[type="number"]').forEach(input => {
  input.addEventListener('change', async (e) => {
   await setTimeout(async () => {
    const quantity = parseInt(e.target.value);
    const productId = e.target.dataset.productId;
    const variant = JSON.parse(e.target.dataset.variant);

    try {
      const response = await fetch(`/cart/update/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity, variant }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      
      // Cập nhật UI
      window.location.reload();
    } catch (error) {
      alert(error.message);
    }
    }, 1000); 
  });
});

// Xử lý xóa sản phẩm
document.querySelectorAll('.remove-item-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const productId = btn.dataset.productId;
    const variant = JSON.parse(btn.dataset.variant);

    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) return;

    try {
      const response = await fetch(`/cart/delete/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ variant }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);     
      window.location.reload();
    } catch (error) {
      alert(error.message);
    }
  });
});