export default () => {
  const button = document.querySelector('.btn');
  button.addEventListener('click', () => {
    console.log('hello!');
  });
  return button;
};
