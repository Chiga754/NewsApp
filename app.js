// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

const newsService = (function () {
  const apiKey = 'd8ce6da393e1497c9b189709428ccf04';
  const apiURL = 'https://newsapi.org/v2/'

  return {
    topHeadlines(country = 'ru', category = 'business', cb){
      http.get(`${apiURL}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`, cb);
    },
    everything(query, cb){
      http.get(`${apiURL}/everything?q=${query}&apiKey=${apiKey}`, cb);
    }
  }
})();

//Elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];
const categorySelect = form.elements['??ategory'];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
})

//  init selects
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews();
});


// load news function 
function loadNews(){
  showLoader();
  const countryText = countrySelect.value;
  const searchText = searchInput.value;
  const categoryText = categorySelect.value;
  if(!searchText){
    newsService.topHeadlines(countryText, categoryText , onGetResponse);
  } else {
    newsService.everything(searchText , onGetResponse);
  }
}

// Function om get response from server
function onGetResponse(err, res) {
  removeLoader();
  if(err) {
    showAlert(err, 'error-msg');
    return;
  }
  if(!res.articles.length){
    showAlert('???? ?????????????? ???????????????? ???? ??????????????', 'error-msg');
    return;
  }
  renderNews(res.articles);
}

// function render news
function renderNews(news) {
  const container = document.querySelector('.news-container .row');
  if(container.children.length){
    clearContainer(container);
  }
  let fragment = '';
  news.forEach(newsItem => {
    const element = newsTemplate(newsItem);
    fragment += element;
  });
  container.insertAdjacentHTML('afterbegin',fragment);
}

function clearContainer(container) {
    let child = container.lastElementChild;
    while(child){
      container.removeChild(child);
      child = container.lastElementChild;
    }
}

// New item teplate fantion
function newsTemplate({urlToImage, title, url, description}){
  return `
    <div class='col s12'>
      <div class='card'>
        <div class='card-image'>
          <img src='${urlToImage || 'images/no_photo.png'}'>
          <span class='card-title'>${title || ''}</span>
        </div>
        <div class='card-content'>
          <p>${description || ''}</p>
        </div>
        <div class='card-action'>
          <a href="${url}"> Read more </a>
        </div>
      </div>
    </div>
  `
}

function showAlert(msg, type = 'success'){
  M.toast({html: msg, classes: type});
}

function showLoader() {
  document.body.insertAdjacentHTML('afterbegin', `
  <div class="progress">
    <div class="indeterminate"></div>
  </div>
` )
}

function removeLoader() {
  const loader = document.querySelector('.progress');
  if(loader){
    loader.remove();
  }
}