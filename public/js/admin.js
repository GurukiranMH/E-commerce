const deleteProduct = (btn) => {
  const prodId = btn.parentNode.querySelector('[name=productId]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

  const parentElement = btn.closest('article');

  fetch('/admin/product/' + prodId, {
    method: 'Delete',
    headers: {
      'csrf-token': csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      parentElement.remove();
    })
    .catch();
};

// const deleteProduct = document.querySelectorAll('.button');

// deleteProduct.forEach((el) => {
//   el.addEventListener('click', function (e) {
//     console.log('clicked');
//   });
// });
