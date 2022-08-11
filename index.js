const BASE_URL = "https://movie-list.alphacamp.io/";
const INDEX_URL = BASE_URL + "api/v1/movies/";
const POSTER_URL = BASE_URL + "posters/";

const movies = [];
let filteredMovies = [];
const MOVIES_PER_PAGE = 12;
let activePage = 1;

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const changeViewMode = document.querySelector("#change-view-mode");
const changeList = document.querySelector("#change-list");

// 產生 card 樣式的畫面
function renderMovieCard(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${
              POSTER_URL + item.image
            }" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${
                item.id
              }">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${
                item.id
              }">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

// 產生 list 樣式的畫面
function renderMovieList(data) {
  let rawHTML = "";
  rawHTML += `<div>
      <ul>`;

  data.forEach((item) => {
    rawHTML += `
     <li class="d-flex justify-content-between align-items-center">
        <h5 class="card-title">${item.title}</h5>
        <div class="button-group">
             <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
     </li>
     <hr/>
    `;
  });
  rawHTML += `
        </ul>
    </div>
  `;
  dataPanel.innerHTML = rawHTML;
}

// 畫面產生樣式判斷
function activeMode(data) {
  if (changeList.matches(".active")) {
    return renderMovieList(data);
  }
  return renderMovieCard(data);
}

//  產生頁碼
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  //製作 template
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  //放回 HTML
  paginator.innerHTML = rawHTML;
}

// movie modal
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`;
  });
}

// 收藏功能
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }
  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

function getMoviesByPage(page) {
  // 計算起始 Index
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  // 回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

// 切換畫面樣板 'click' 事件
changeViewMode.addEventListener("click", function onModeClicked(event) {
  const modeWithActive = document.querySelector(".mode .active");
  if (modeWithActive) {
    modeWithActive.classList.remove("active");
  }
  if (event.target.matches("#change-card")) {
    event.target.classList.add("active");
    renderMovieCard(getMoviesByPage(activePage));
  } else if (event.target.matches("#change-list")) {
    event.target.classList.add("active");
    renderMovieList(getMoviesByPage(activePage));
  }
});

// 點擊頁碼 'click' 事件
paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== "A") return;

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page);
  activePage = page;
  //更新畫面
  activeMode(getMoviesByPage(page));
});

// more 和 + 按鈕 'click' 事件
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

// 搜尋關鍵字 'submit' 事件
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  if (!keyword.length) {
    filteredMovies = [];
    renderPaginator(movies.length);
    activeMode(getMoviesByPage(1));
    return alert("請輸入有效的字串");
  }

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filteredMovies.length === 0) {
    return alert("找不到輸入的字串：" + keyword);
  }
  activePage = 1;
  renderPaginator(filteredMovies.length);
  activeMode(getMoviesByPage(activePage));
});

// 串接 API
axios
  .get(INDEX_URL)
  .then(function (response) {
    // handle success
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieCard(getMoviesByPage(activePage));
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });
