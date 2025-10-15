const countries = require('../datasets/countries.json');
// const srv = require('./server.js');

const countryNames = [];
let subregions = [];
for (let i = 0; i < countries.length; i++) {
  countryNames[i] = countries[i].name;
  if (!subregions.includes(countries[i].subregion)) {
    subregions += countries[i].subregion;
  }
}

const respondJSON = (request, response, status, object) => {
  const content = JSON.stringify(object);
  // console.log(content);
  if (request.body) {
    // console.log(request.body);
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
    if ((name === null || countryName.toUpperCase().includes(name.toUpperCase()))
      && (countryRegion === region || region === 'None' || region === null)) {
      responseJSON[countryName] = { countryName };
    }
  }

  // console.log(responseJSON);
  return respondJSON(request, response, 200, responseJSON);
};

const getSubregions = (request, response) => {
  const responseJson = {};
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
  const name = parsedUrl.searchParams.get('name');
  let region = parsedUrl.searchParams.get('region');

  if (region === 'Other') {
    region = '';
  }

  let currentSubs = [];
  for (let i = 0; i < countries.length; i++) {
    const countryName = countries[i].name;
    const countryRegion = countries[i].region;
    const countrySubregion = countries[i].subregion;

    if ((countryRegion === region || region === 'None' || region === null)
      && !currentSubs.includes(countrySubregion)
      && (name === null || countryName.toUpperCase().includes(name.toUpperCase()))) {
      responseJson[countryName] = { countrySubregion };
      currentSubs += countrySubregion;
    }
  }

  // console.log(responseJson);
  return respondJSON(request, response, 200, responseJson);
};

const getTimezones = (request, response) => {
  const responseJSON = {};
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
  const name = parsedUrl.searchParams.get('name');
  let region = parsedUrl.searchParams.get('region');

  if (region === 'Other') {
    region = '';
  }

  let timezones = [];
  for (let i = 0; i < countries.length; i++) {
    const countryTimezones = countries[i].timezones;
    const countryRegion = countries[i].region;

    const countryName = countries[i].name;

    if ((region === null || countryRegion === region || region === 'None')
      && (name === null || countryName.toUpperCase().includes(name.toUpperCase()))) {
      for (let j = 0; j < countryTimezones.length; j++) {
        const abbr = countryTimezones[j].abbreviation;
        if (!timezones.includes(abbr)) {
          // console.log(abbr);
          timezones += abbr;
          responseJSON[abbr] = { abbr };
          responseJSON[abbr].name = countryTimezones[j].tzName;
          responseJSON[abbr].gmtOffset = countryTimezones[j].gmtOffset;
          // responseJSON[abbr].countriesInZone=`${countryName}, `;
        }// else if (responseJSON[abbr].countriesInZone){
        //   console.log(responseJSON[abbr]);
        //   responseJSON[abbr].countriesInZone+=`${countryName}, `;
        // }
      }
    }
  }
  // console.log(responseJSON);
  respondJSON(request, response, 200, responseJSON);
};

const getCapitals = (request, response) => {
  const responseJSON = {};
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
  const name = parsedUrl.searchParams.get('name');
  let region = parsedUrl.searchParams.get('region');

  if (region === 'Other') {
    region = '';
  }

  for (let i = 0; i < countries.length; i++) {
    const { capital } = countries[i];
    const countryRegion = countries[i].region;
    const countryName = countries[i].name;

    if ((name === null || countryName.toUpperCase().includes(name.toUpperCase()))
      && (region === null || countryRegion === region || region === 'None')) {
      responseJSON[countryName] = { countryName };
      responseJSON[countryName].capital = capital;
    }
  }

  respondJSON(request, response, 200, responseJSON);
};

const addCountry = (request, response) => {
  const responseJSON = {
    message: 'Name is required',
  };

  // const { name, region }=request.body;
  const newName = request.body.name;
  let newRegion = request.body.region;
  if (newRegion === 'Other') {
    newRegion = '';
  }

  if (!newName) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 204;

  if (countryNames.indexOf(newName) === -1) {
    responseCode = 201;
    countries.push({ name: newName, region: newRegion });
    countryNames[countryNames.length] = newName;
  } else {
    countries[countryNames.indexOf(newName)].region = newRegion;
  }

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSON(request, response, responseCode, {});
};

const addData = (request, response) => {
  const responseJSON = {
    message: 'Valid name is required',
  };

  const { name } = request.body;
  const { data } = request.body;
  const { value } = request.body;

  if (!name) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  if (!(countryNames.includes(name))) {
    responseJSON.id = 'Invalid Country Name';
    return respondJSON(request, response, 400, responseJSON);
  }

  if (!data || !value) {
    responseJSON.message = 'Invalid data or value';
    responseJSON.id = 'badInput';
    return respondJSON(request, response, 400, responseJSON);
  }

  const responseCode = 204;
  const index = countryNames.indexOf(name);
  countries[index][data] = value;
  responseJSON.message = 'Data added';
  responseJSON.id = 'updated';
  return respondJSON(request, response, responseCode, responseJSON);
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

const getCountryNames = () => countryNames;

module.exports = {
  notFound,
  getCountries,
  addCountry,
  getSubregions,
  getTimezones,
  getCapitals,
  respondJSON,
  getCountryNames,
  addData,
};
