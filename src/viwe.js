import onChange from 'on-change';
import i18next from 'i18next';

export default (state) => {
  const watchedState = onChange(state, (path, value) => {
    const modal = document.createElement('div');
    modal.innerHTML = `<div class="modal fade" id="modalId" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">{post.title}</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            {post.description}
          </div>
          <div class="modal-footer">
            <button type="button" href={post.link} class="btn btn-primary">Read</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>`;
    document.body.prepend(modal);
    const containerFeeds = document.querySelector('.feeds');
    const containerPosts = document.querySelector('.posts');
    const feedback = document.querySelector('.feedback');
    // containerFeeds.innerHTML = `<h2>Feeds</h2>`;
    // posts.innerHTML = `<h2>posts</h2>`;
    if (path === 'valid') {
      const form = document.querySelector('.rss-form');
      const input = document.querySelector('input');
      if (value) {
        input.classList.remove('is-invalid');
        form.reset();
        return;
      }
      return;
    }
    if (path === 'formState.state') {
      switch (value) {
        case 'loaded':
          feedback.classList.remove('text-danger');
          feedback.classList.add('text-success');
          feedback.innerHTML = i18next.t('loaded');
          break;
        case 'invalid':
          feedback.classList.add('text-danger');
          feedback.innerHTML = i18next.t('invalid');
          break;
        case 'networkError':
          feedback.classList.add('text-danger');
          feedback.innerHTML = i18next.t('networkError');
          break;
        case 'already':
          feedback.classList.add('text-danger');
          feedback.innerHTML = i18next.t('already');
          break;
        case 'rssRequired':
          feedback.classList.add('text-danger');
          feedback.innerHTML = i18next.t('rssRequired');
          break;
        default:
          console.log('Error');
      }
    }
    if (path === 'feeds') {
      console.log(value);
      const ulEl = document.createElement('ul');
      value.forEach((feed) => {
        const liEl = document.createElement('li');
        const h3 = document.createElement('h3');
        const pEl = document.createElement('p');
        h3.textContent = feed.name;
        pEl.textContent = feed.description;
        liEl.append(h3);
        liEl.append(pEl);
        ulEl.prepend(liEl);
      });
      containerFeeds.innerHTML = '<h2>Feeds</h2>';
      containerFeeds.appendChild(ulEl);
    }
    if (path === 'posts') {
      const ulEl = document.createElement('ul');
      value.forEach((posts) => {
        posts.reverse().forEach((post) => {
          const liEl = document.createElement('li');
          liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
          const button = document.createElement('button');
          button.classList.add('btn', 'btn-primary');
          button.setAttribute('data-target', 'modalId');
          button.setAttribute('data-toggle', 'modal');
          button.textContent = 'show';
          const aEl = document.createElement('a');
          aEl.setAttribute('href', post.link);
          aEl.textContent = post.name;
          aEl.classList.remove('fw-normal');
          aEl.classList.add('fw-bold');
          liEl.append(button);
          button.addEventListener('click', () => {
            const modalWindow = document.querySelector('.modal');
            modalWindow.classList.add('show');
            aEl.classList.remove('fw-bold');
            aEl.classList.add('fw-normal');
          });
          liEl.prepend(aEl);
          ulEl.prepend(liEl);
        });
      });
      containerPosts.innerHTML = '<h2>Posts</h2>';
      containerPosts.appendChild(ulEl);
    }
  });
  return watchedState;
};
