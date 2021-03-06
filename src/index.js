import './sass/main.scss';
import './js/search-img';

import fetchImages from './js/search-img';
import cardTemplate from './card-template/templates-card.hbs';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';



const { searchForm, galleryEl, loadMoreBtn, endCollectionText } = {
    searchForm: document.querySelector('.search-form'),
    galleryEl: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-more'),
    endCollectionText: document.querySelector('.end-collection-text'),
  };
  
  function renderCardImage(arr) {
    const markup = arr.map(item => cardTemplate(item)).join('');
    galleryEl.insertAdjacentHTML('beforeend', markup);
  }
  
  let lightbox = new SimpleLightbox('.photo-card a', {
    captions: true,
    captionsData: 'alt',
    captionDelay: 250,
  });
  
  let currentPage = 1;
  let currentHits = 0;
  let searchQuery = '';
  
  searchForm.addEventListener('submit', onSubmitSearchForm);
  
  async function onSubmitSearchForm(e) {
    e.preventDefault();
    searchQuery = e.currentTarget.searchQuery.value;
    currentPage = 1;
  
    if (searchQuery === '') {
      return;
    }
  
    const response = await fetchImages(searchQuery, currentPage);
    currentHits = response.hits.length;
  
    if (response.totalHits > 40) {
      loadMoreBtn.classList.remove('is-hidden');
    } else {
      loadMoreBtn.classList.add('is-hidden');
    }
  
    try {
      if (response.totalHits > 0) {
        Notify.success(`Hooray! We found ${response.totalHits} images.`);
        galleryEl.innerHTML = '';
        renderCardImage(response.hits);
        lightbox.refresh();
        endCollectionText.classList.add('is-hidden');
  
        const { height: cardHeight } = document
          .querySelector('.gallery')
          .firstElementChild.getBoundingClientRect();
  
        window.scrollBy({
          top: cardHeight * -100,
          behavior: 'smooth',
        });
      }
  
      if (response.totalHits === 0) {
        galleryEl.innerHTML = '';
        Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        loadMoreBtn.classList.add('is-hidden');
        endCollectionText.classList.add('is-hidden');
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  loadMoreBtn.addEventListener('click', onClickLoadMoreBtn);
  
  async function onClickLoadMoreBtn() {
    currentPage += 1;
    const response = await fetchImages(searchQuery, currentPage);
    renderCardImage(response.hits);
    lightbox.refresh();
    currentHits += response.hits.length;
  
    if (currentHits === response.totalHits) {
      loadMoreBtn.classList.add('is-hidden');
      endCollectionText.classList.remove('is-hidden');
    }
  }

