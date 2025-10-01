const countries = require('../datasets/countries.json');

const respondJSON = (request, response, status, object) => {
  const content = JSON.stringify(object);
  if(request.body){
    console.log(request.body);
  }
  
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
  //250 countries in list
  //console.log(countries.length);
  let responseJSON={}
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl=new URL(request.url, `${protocol}://${request.headers.host}`);
  const name = parsedUrl.searchParams.get("name");
  for(let i=0;i<countries.length;i++){
    const countryName=countries[i].name;
    if(countryName.includes(name)){
      responseJSON+=countries[i];      
    }
  }


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
