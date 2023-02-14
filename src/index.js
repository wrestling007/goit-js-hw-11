import PictureApiService from './js/picture-api';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import galleryTpl from './templates/gallery-card.hbs';
import throttle from 'lodash.throttle';
import SmoothScroll from 'smoothscroll-for-websites';

const refs = {
  body: document.querySelector('body'),
  searchForm: document.querySelector('#search-form'),
  input: document.querySelector('input'),
  submitButton: document.querySelector('button'),
  gallery: document.querySelector('.gallery'),
  loader: document.querySelector('.loader'),
  homeButton: document.querySelector('.home-btn'),
};

refs.searchForm.addEventListener('submit', onSearch);
refs.homeButton.addEventListener('click', onClickHomeBtn);
refs.input.addEventListener('input', throttle(onInput, 300));
window.addEventListener('wheel', throttle(onScroll, 300));

const lightbox = new SimpleLightbox('.photo-card', {
  captionsData: 'alt',
  captionDelay: 250,
});
const pictureServise = new PictureApiService();

function onSearch(evt) {
  evt.preventDefault();
  pictureServise.resetPageNumber();
  pictureServise.query = evt.currentTarget.elements.searchQuery.value;
  fetchingQuery();
  refs.input.value = '';

  cleanMarcUp();
  refs.submitButton.setAttribute('disabled', 'disabled');
  observer.unobserve(refs.loader);
}

function fetchingQuery() {
  refs.loader.classList.remove('hidden');
  pictureServise.fetchPicture().then(renderGallery).catch(console.log);
}

function renderGallery(data) {
  if (!data) {
    observer.unobserve(refs.loader);
    refs.loader.classList.add('hidden');
    refs.submitButton.setAttribute('disabled', 'disabled');
    refs.homeButton.classList.add('hidden');
    return;
  }
  marcUp(data);
  observer.observe(refs.loader);
  refs.loader.classList.add('hidden');
  if (pictureServise.totalPage < pictureServise.pageNumber) {
    observer.unobserve(refs.loader);
    refs.loader.classList.add('hidden');
  }
}

function marcUp(dataArray) {
  if (!dataArray) return;
  const marcUp = galleryTpl(dataArray);
  refs.gallery.insertAdjacentHTML('beforeend', marcUp);
  lightbox.refresh();
}

function cleanMarcUp() {
  refs.gallery.innerHTML = '';
}

//////////////////////  observer  \\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const options = {
  root: null,
  rootMargin: '200px',
  threshold: 0,
};

const observer = new IntersectionObserver(observerCallback, options);

function observerCallback(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      fetchingQuery();
      const documentRect = document
        .querySelector('.gallery')
        .getBoundingClientRect();
      console.log(documentRect);
    }
  });
}

////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function onInput(evt) {
  refs.submitButton.removeAttribute('disabled');
}

function onScroll(evt) {
  if (evt.deltaY < 0) {
    refs.searchForm.classList.remove('hidden');
    refs.homeButton.classList.remove('hidden');
  } else {
    refs.searchForm.classList.add('hidden');
    refs.homeButton.classList.add('hidden');
  }
}

function onClickHomeBtn() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

SmoothScroll({
  stepSize: 175,
  animationTime: 800,
  accelerationDelta: 200,
  accelerationMax: 6,
  keyboardSupport: true,
  arrowScroll: 100,
});