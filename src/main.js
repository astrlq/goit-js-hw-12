import './css/styles.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  initLightbox,
  showLoadMoreButton,
  hideLoadMoreButton,
  showEndMessage,
  hideEndMessage,
} from './js/render-functions';

const form = document.querySelector('.form');
const input = document.querySelector('input[name="search-text"]');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const loader = document.querySelector('.loader');
const endMessage = document.querySelector('.end-message');

const perPage = 15;
let query = '';
let page = 1;
let totalHits = 0;

const lightbox = initLightbox();

function scrollGallery() {
  const galleryItemHeight =
    gallery.firstElementChild.getBoundingClientRect().height;
  window.scrollBy({
    top: galleryItemHeight * 2,
    behavior: 'smooth',
  });
}

async function fetchImages() {
  showLoader();
  hideEndMessage();
  hideLoadMoreButton();

  try {
    const data = await getImagesByQuery(query, page);
    totalHits = data.totalHits;
    const images = data.hits;

    if (images.length === 0) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      clearGallery();
      return;
    }

    createGallery(images);

    const loadedImagesCount = page * perPage;

    if (loadedImagesCount >= totalHits) {
      showEndMessage();
    } else {
      showLoadMoreButton();
    }

    if (page > 1) {
      scrollGallery();
    }
  } catch (error) {
    iziToast.error({
      message: `Error fetching images: ${error.message}`,
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}

async function onSearch(event) {
  event.preventDefault();

  const newQuery = input.value.trim();

  if (newQuery === '') {
    iziToast.warning({
      message: 'Please enter a search term.',
      position: 'topRight',
    });
    return;
  }

  if (newQuery === query) {
    return;
  }

  query = newQuery;
  page = 1;
  clearGallery();
  hideEndMessage();

  await fetchImages();
}

async function onLoadMore() {
  page += 1;
  hideLoadMoreButton();
  await fetchImages();
}

if (form) form.addEventListener('submit', onSearch);
if (loadMoreBtn) loadMoreBtn.addEventListener('click', onLoadMore);
