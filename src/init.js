import * as yup from 'yup';
import axios from 'axios';
import render from './viwe';
import _ from 'lodash';
import i18next from 'i18next';
import resources from './locales';

const schema = yup.object().shape({
  url: yup.string().required(i18next.t('rssRequired')).url(),
});

const parser = (data) => {
  console.log('data', data);
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(data.contents, "application/xml");
  const items = [...doc.getElementsByTagName('item')];
  const mappedItems = items.map((el) => {
    const newItem = {
      title: el.querySelector('title').textContent,
      link: el.querySelector('link').textContent,
      description: el.querySelector('description').textContent,
    };
    return newItem;
  });
  console.log('!!', doc);
  return {
    title: doc.querySelector('title').textContent,
    chanelDescription: doc.querySelector('description').textContent,
    items: mappedItems,
  };
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

  const loadedPosts = () => {
    const promises = state.urls.map(address => axios.get(address));
    Promise.all(promises).then((responses) => {
      responses.forEach((res) => {
        const { title, items } = parser(res.data);
        const actualFeedIndex = state.feeds.findIndex(el => el.title === title);
        const oldItems = state.feeds[actualFeedIndex].items;
        const newItems = _.unionWith(oldItems, items, _.isEqual);
        if (!_.isEqualWith(newItems, oldItems, (e1, e2) => _.isEqual(e1, e2))) {
          state.feeds[actualFeedIndex].items = newItems;
        }
      });
      setTimeout(loadedPosts, 5000);
    });
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
            watchedState.feeds.push(parser(res.data));
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
    }).then(() => loadedPosts());
  });
};
export default () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources
  }).then(run);
}