const http = require('http');
// const countries = require('../datasets/countries.json');
const query = require('querystring');
const htmlResponses = require('./htmlResponses.js');
const jsonResponses = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const parseBody = (request, response) => {
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    request.body = query.parse(bodyString);

    jsonResponses.addCountry(request, response);
  });
};

const urlStruct = {
  '/': htmlResponses.getIndex,
  '/style.css': htmlResponses.getCSS,
  '/getCountries': jsonResponses.getCountries,
  '/getSubregions':jsonResponses.getSubregions,
  '/getTimezones':jsonResponses.getTimezones,
  '/addCountry': parseBody,
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
