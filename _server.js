// const next = require('next');
// const express = require('express');

// const port = parseInt(process.env.PORT, 10) || 3004;
// const dev = process.env.NODE_ENV !== 'production';
// const app = next({
//   dev,
// });

// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   const server = express();

//   server.use(express.json());
//   server.use(express.urlencoded({ extended: true }));

//   server.get('/main', (req, res) => app.render(req, res, '/main'));

//   server.get('/user/:id', (req, res) => app.render(req, res, '/user/[id]'));

//   server.get('*', (req, res) => handle(req, res));

//   server.listen(port, (err) => {
//     if (err) throw err;
//     console.log(`> Ready on http://localhost:${port}`);
//   });
// });
