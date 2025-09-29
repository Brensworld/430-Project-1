const countries = require('../datasets/countries.json');

const respondJSON = (request, response, status, object) => {
  const content = JSON.stringify(object);

  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  };

  response.writeHead(status, headers);

  // 204 is an update, has no body message
  if (request.method !== 'HEAD') {
    response.write(content);
  }

  response.end();
};

const getCountries = (request, response) => {
  console.log(countries.length);
  const num=Math.random()*250

  const responseJSON = {
    countries,
  };

  return respondJSON(request, response, 200, responseJSON);
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

module.exports = {
  notFound,
  getCountries,
};
