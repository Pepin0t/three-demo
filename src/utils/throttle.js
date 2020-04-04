// for functional components only

let id = null;

const throttle = (fn, delay) => (...args) => {
  if (!id) {
    fn(...args);

    id = setTimeout(() => {
      id = null;
    }, delay);
  }
};

export default throttle;
