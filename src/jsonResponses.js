const countries = require('../datasets/countries.json');

let countryNames = [];
for (let i = 0; i < countries.length; i++) {
  countryNames = countries[i].name;
}

const respondJSON = (request, response, status, object) => {
  const content = JSON.stringify(object);
  if (request.body) {
    console.log(request.body);
  }

  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  };

  response.writeHead(status, headers);

  // 204 is an update, has no body message
  if (request.method !== 'HEAD' && status !== 204) {
    response.write(content);
  }

  response.end();
};

const getCountries = (request, response) => {
  // 250 countries in list
  // console.log(countries.length);
  const responseJSON = {};
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
  const name = parsedUrl.searchParams.get('name');
  let region = parsedUrl.searchParams.get('region');

  // countries in other regions have the region of ""
  if (region === 'Other') {
    region = '';
  }

  for (let i = 0; i < countries.length; i++) {
    const countryName = countries[i].name;
    const countryRegion = countries[i].region;

    if (countryName.includes(name) && (countryRegion === region || region === 'None')) {
      responseJSON[countryName] = { countryName };
    }
  }

  console.log(responseJSON);
  return respondJSON(request, response, 200, responseJSON);
};

const addCountry = (request, response) => {
  const responseJSON = {
    message: 'Name is both required',
  };

  // const { name, region }=request.body;
  const newName = request.body.name;
  const newRegion = request.body.region;

  if (!newName) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 204;

  if (!countryNames.includes[newName]) {
    responseCode = 201;
    countries.push({ name: newName, region: newRegion });
  } else {
    countries[countryNames.indexOf(newName)].region = newRegion;
  }

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSON(request, response, responseCode, {});
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
  addCountry,
};
