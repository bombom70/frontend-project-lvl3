import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import * as yup from 'yup';
import axios from 'axios';
import render from './viwe';
import _ from 'lodash';
import i18next from 'i18next';
import resources from './locales';

const schema = yup.object().shape({
  url: yup.string().required(i18next.t('rssRequired')).url(),
});

const loadedPosts = (urls) => {
  const promises = urls.map((url) => axios.get(url));
  Promise.all(promises).then((res) => {
    console.log(res);
    return res;
  });
  setTimeout(() => {
    console.log('!')
    loadedPosts(urls);
  }, 5000);
};

const parser = (data) => {
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(data, "application/xml");
  const titleFeeds = doc.querySelector('title');
  const descriptionFeeds = doc.querySelector('description');
  const items = doc.querySelectorAll('item');
  const id = _.uniqueId();
  const posts = [...items].reduce((acc, item) => {
    const linkTag = item.querySelector('link');
    const link = linkTag.textContent;
    const title = item.querySelector('title');
    const description = item.querySelector('description');
    return [...acc, { feedId: id, id: _.uniqueId(), name: title.textContent, description: description.textContent, link }];
  }, []);
  const feeds = { id, name: titleFeeds.textContent, description: descriptionFeeds.textContent};
  return { feeds, posts };
};

const run = () => {
  const state = {
    formState: {
      state: '',
      value: '',
    },
    valid: null,
    urls: [],
    feeds: [],
    posts: [],
    data: '',
  };
  const watchedState = render(state);
  const form = document.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');
    schema.isValid({
      url: value
    })
    .then((valid) => {
      const url = `https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(value)}`;
      if (valid) {
        if (watchedState.urls.includes(url)) {
          watchedState.formState.state = 'already';
          return;
        }
        axios.get(url)
          .then((res) => {
            const { feeds, posts } = parser(res.data.contents);
            watchedState.feeds.push(feeds);
            watchedState.posts.push(posts);
          })
          .catch((e) => {
            watchedState.formState.state = 'networkError';
          });
        watchedState.urls.push(url);
        watchedState.valid = true;
        watchedState.formState.value = value;
        watchedState.formState.state = 'loaded';
        return ;
      }
      watchedState.urls.push(url);
      watchedState.valid = false;
      if (value.trim() === '') {
        watchedState.formState.state = 'rssRequired';
        return;
      }
      watchedState.formState.state = 'invalid';
    });
    loadedPosts(watchedState.urls);
  });
};
export default () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources
  }).then(run);
}