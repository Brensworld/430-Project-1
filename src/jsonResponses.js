const countries = require('../datasets/countries.json');

let countryNames = [];
let subregions=[];
for (let i = 0; i < countries.length; i++) {
  countryNames = countries[i].name;
  if(!subregions.includes(countries[i].subregion)){
    subregions+=countries[i].subregion;
  }
}

const respondJSON = (request, response, status, object) => {
  const content = JSON.stringify(object);
  //console.log(content);
  if (request.body) {
    //console.log(request.body);
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

    if (countryName.toUpperCase().includes(name.toUpperCase()) && (countryRegion === region || region === 'None')) {
      responseJSON[countryName] = { countryName };
    }
  }

  //console.log(responseJSON);
  return respondJSON(request, response, 200, responseJSON);
};

const getSubregions=(request,response)=>{
  const responseJson={};
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
  const name=parsedUrl.searchParams.get('name');
  let region = parsedUrl.searchParams.get('region');

  if (region === 'Other') {
    region = '';
  }

  let currentSubs=[];
  for(let i=0;i<countries.length;i++){
    const countryName=countries[i].name;
    const countryRegion = countries[i].region;
    const countrySubregion=countries[i].subregion;


    if((countryRegion=== region || region==='None') && !currentSubs.includes(countrySubregion)&& countryName.toUpperCase().includes(name.toUpperCase())){
      responseJson[countryName]={ countrySubregion };
      currentSubs+=countrySubregion;
    }
  }

  //console.log(responseJson);
  return respondJSON(request, response, 200, responseJson);

}

const getTimezones=(request,response)=>{
  let responseJSON={};
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
  const name=parsedUrl.searchParams.get('name');
  let region = parsedUrl.searchParams.get('region');

  if(region==='Other'){
    region='';
  }

  let timezones=[];
  for(let i=0;i<countries.length;i++){
      const countryTimezones=countries[i].timezones;
      const countryRegion = countries[i].region;

      const countryName=countries[i].name;
      
      if((countryRegion===region || region==='None')&& countryName.toUpperCase().includes(name.toUpperCase())){
        for(let j=0;j<countryTimezones.length;j++){
          let abbr=countryTimezones[j].abbreviation
          if(!timezones.includes(abbr)){
            //console.log(abbr);
            timezones+=abbr;
            responseJSON[abbr]={abbr};
            responseJSON[abbr].name=countryTimezones[j].tzName;
            responseJSON[abbr].gmtOffset=countryTimezones[j].gmtOffset;
            //responseJSON[abbr].countriesInZone=`${countryName}, `;
          }//else if (responseJSON[abbr].countriesInZone){
          //   console.log(responseJSON[abbr]);
          //   responseJSON[abbr].countriesInZone+=`${countryName}, `;
          // }
        }
      }
  }
  //console.log(responseJSON);
  respondJSON(request,response,200,responseJSON);

}

const getCapitals=(request,response)=>{
  let responseJSON={};
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
  const name = parsedUrl.searchParams.get('name');
  let region = parsedUrl.searchParams.get('region');

  if(region==='Other'){
    region='';
  }

  for(let i=0;i<countries.length;i++){
    const captial=countries[i].capital
    const countryRegion=countries[i].region;
    const countryName=countries[i].name;

    if(countryName.toUpperCase().includes(name.toUpperCase()) && (countryRegion===region||region==='None')){
      responseJSON[countryName]={countryName};
      responseJSON[countryName].captial=captial;
    }
  }

  respondJSON(request,response,200,responseJSON);
}

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
  getSubregions,
  getTimezones,
  getCapitals,
  respondJSON
};
