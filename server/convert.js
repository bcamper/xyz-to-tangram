const axios = require('axios');
const yaml = require('js-yaml');

const xyzToTangram = require('../dist/xyz-to-tangram');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async function handler (event, context, callback) {
  let statusCode = 200;
  let body = '';

  // Skip non-GET requests (for example, CORS preflight OPTIONS requests)
  if (event.httpMethod !== 'GET') {
    return callback(null, {
      statusCode,
      headers,
      body
    });
  }

  const query = event.queryStringParameters;

  let xyzProjectId = query.project_id;
  if (xyzProjectId == null) {
    // TODO: handle missing project id
    // throw Error('No project_id on query string!');
    xyzProjectId = 'daf86376-b159-4b9e-bee3-04aa6aca6a10';
  }

  try {
    // Load XYZ studio viz JSON
    const xyzURL = `https://xyz.api.here.com/project-api/projects/${xyzProjectId}`;
    const xyzStyle = (await axios.get(xyzURL)).data;

    // Conversion options
    const options = {
      basemap: query.basemap
    };

    if (query.collide != null) {
      options.collide = Boolean(parseFloat(query.collide));
    }

    if (query.labelsOnTop != null) {
      options.labelsOnTop = Boolean(parseFloat(query.labelsOnTop));
    }

    // Convert to Tangram scene
    let { scene } = xyzToTangram(xyzStyle, options);

    // output JSON or YAML
    if (query.format === 'yaml') {
      headers['Content-Type'] = 'text/plain';
      body = yaml.safeDump(scene);
    }
    else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(scene);
    }

  }
  catch (e) {
    statusCode = 500;
    body = `Couldn't convert XYZ Studio project id ${xyzProjectId} to Tangram scene!\n${e.stack}`;
  }

  callback(null, {
    statusCode,
    headers,
    body
  });
};
