const http = require('http');
const countries = require('../datasets/countries.json');
const htmlResponses = require('./htmlResponses.js');
const jsonResponses = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': htmlResponses.getIndex,
  '/style.css': htmlResponses.getCSS,
  '/getCountries': jsonResponses.getCountries,
  notFound: jsonResponses.notFound,
};

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  if (urlStruct[parsedUrl.pathname]) {
    return urlStruct[parsedUrl.pathname](request, response);
  }
  return urlStruct.notFound(request, response);
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});
