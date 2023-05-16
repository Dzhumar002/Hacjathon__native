const API = "http://localhost:8000/products";

// переменные для Навбара и button
const indicator = document.querySelector(".nav-indicator");
const items = document.querySelectorAll(".nav-item");
const cart = document.querySelector(".cart__icon");
const adminModal = document.querySelector(".login-box");
const adminIcon = document.querySelector("#admin__panel");
const closeModal = document.querySelector(".close__modal");

// ? Переменные для инпутов: для добавления товаров
// let inp = document.querySelector(".inp");
let title = document.querySelector("#add-title");
let price = document.querySelector("#add-price");
let image = document.querySelector("#add-img");
let btnAdd = document.querySelector("#add-save");
let editButton = document.querySelector(".edit-button");
let btnEdit = document.querySelector("#add-edit");

// ? блок куда добавляются карточки товара

let list = document.querySelector("#product-list");

// ! search

let searchInp = document.querySelector("#search");
let searchVal = "";

//! Pagination

let currentPage = 1; //текущая страница
let pageTotalCount = 1; //общее количество страниц
let paginationList = document.querySelector(".pagination-list");
let prev = document.querySelector("#prev");
let next = document.querySelector("#next");

// Функция для работы Навбара
function handleIndicator(el) {
  items.forEach((item) => {
    item.classList.remove("is-active");
    item.removeAttribute("style");
  });

  indicator.style.width = `${el.offsetWidth}px`;
  indicator.style.left = `${el.offsetLeft}px`;
  indicator.style.backgroundColor = el.getAttribute("active-color");

  el.classList.add("is-active");
  el.style.color = el.getAttribute("active-color");
}

items.forEach((item, index) => {
  item.addEventListener("click", (e) => {
    handleIndicator(e.target);
  });
  item.classList.contains("is-active") && handleIndicator(item);
});
// -----------------------------------

// function for hidden cart

// ? Функция показа админ панеля

adminIcon.addEventListener("click", () => {
  adminModal.style.display = "block";
  btnAdd.style.display = "initial";
  btnEdit.style.display = "none";
  title.value = "";
  price.value = "";
  image.value = "";
});

//? Функция звкрытия админ панеля

closeModal.addEventListener("click", () => {
  adminModal.style.display = "none";
});

// событие на кнопку добавить

btnAdd.addEventListener("click", async function () {
  //обьект для добавление db.json

  let obj = {
    title: title.value,
    price: price.value,
    image: image.value,
  };
  console.log(obj);
  //  проверка на заполненость инпутов

  if (!obj.title.trim() || !obj.price.trim() || !obj.image.trim()) {
    alert("Заполните все поля");
    return;
  }
  //   запрос для добавления

  await fetch(API, {
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(obj),
  });

  // Очищаем инпуты

  title.value = "";
  price.value = "";
  image.value = "";

  adminModal.style.display = "none";

  // render обновленного товара
  render();
});

// ! отображение карточек товаров

async function render() {
  let products = await fetch(
    `${API}?q=${searchVal}&_page=${currentPage}&_limit=4`
  )
    .then((responce) => responce.json())
    .catch((err) => console.log(err));

  drawPaginationButtons();

  list.innerHTML = "";

  products.forEach((card) => {
    // console.log(card);
    let elem = document.createElement("div");
    elem.innerHTML = `
    <div class="card">
    <div class="card-headphone">
        <img src="${card.image}" alt="headphone">
    </div>
    <div class="card-infos">
        <h3 class="card-title">${card.title}</h3>
        
        <h2 class="price">$${card.price}</h2>
        <a class="delete-edit">
        <img src="./images/Delete_icon.png" 
        id=${card.id} alt="delete" class="delete-button"  width="20px" height="20px"
      />
      <img src="./images/Edit_icon.png" id=${card.id} alt="edit" onclick="editCard(${card.id})"  class="edit-button" width="20px" height="20px"
      /></a>
       
        
    </div>
   
</div>
    `;
    list.append(elem);
  });
}
render();
// ! Удаление товара

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-button")) {
    let id = e.target.id;
    await fetch(`${API}/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        render();
      });
  }
});

// ! Редактирование Товара

async function editCard(id) {
  editId = id;
  adminModal.style.display = "block";
  btnAdd.style.display = "none";
  btnEdit.style.display = "block";

  let res = await fetch(`${API}/${id}`);
  let data = await res.json();

  image.value = data.image;
  title.value = data.title;
  price.value = data.price;
}

// ! слушатель событий на Edit
btnEdit.addEventListener("click", async () => {
  let obj = {
    image: image.value,
    title: title.value,
    price: price.value,
  };

  await fetch(`${API}/${editId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(obj),
  });

  adminModal.style.display = "none";

  render();
});

searchInp.addEventListener("input", (e) => {
  searchVal = e.target.value;
  render();
});

//! PAGINATION
function drawPaginationButtons() {
  fetch(`${API}?q=${searchVal}`)
    .then((res) => res.json())
    .then((data) => {
      pageTotalCount = Math.ceil(data.length / 4);
      paginationList.innerHTML = "";
      for (let i = 1; i <= pageTotalCount; i++) {
        // создаем кнопки  с цифрами
        if (currentPage == i) {
          let page1 = document.createElement("div");
          page1.innerHTML = ` <a class="active page-number" href="#">${i}</a>
          `;
          paginationList.append(page1);
        } else {
          let page2 = document.createElement("li");
          page2.innerHTML = `<a class="page-number" href="#">${i}</a>`;
          paginationList.append(page2);
        }
      }

      // ? красим в серый цвет кнопки prev/next
      if (currentPage == 1) {
        prev.classList.add("disabled");
      } else {
        prev.classList.remove("disabled");
      }

      if (currentPage == pageTotalCount) {
        prev.classList.add("disabled");
      } else {
        prev.classList.remove("disabled");
      }
    });
}

//  кнопка переключения на предыдущую страницу

prev.addEventListener("click", () => {
  if (currentPage <= 1) {
    return;
  }
  currentPage--;
  render();
});

//?  кнопка переключения на следующую страницу

next.addEventListener("click", () => {
  if (currentPage >= pageTotalCount) {
    return;
  }
  currentPage++;
  render();
});

//? кнопка переключения на определенную страницу

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("page-number")) {
    currentPage = e.target.innerText;
    render();
  }
});
