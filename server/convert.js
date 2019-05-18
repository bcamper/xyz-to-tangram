
const axios = require('axios');
const yaml = require('js-yaml');
// const merge = require('lodash.merge');

// XYZ/Tangram-specifics
const xyzToTangram = require('../dist/xyz-to-tangram');
// const basemaps = require('../basemaps'); // basemap options to import alongside XYZ viz

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

  // Load XYZ studio viz JSON
  const xyzURL = `https://xyz.api.here.com/project-api/projects/${xyzProjectId}`;
  console.log('requesting XYZ project', xyzURL);
  let xyzStyle;
  try {
    xyzStyle = (await axios.get(xyzURL)).data;
  }
  catch (e) {
    response.send(`Couldn't load XYZ Studio project id ${xyzProjectId}!\n${e.stack}`);
  }
  // console.log(xyzStyle);

  // Convert to Tangram scene
  try {
    const collide = !(query.collide != null && query.collide == 0);
    // const labelsOnTop = !(query.labelsOnTop != null && query.labelsOnTop != '' && query.labelsOnTop == 0);

    let { scene } = xyzToTangram(xyzStyle, { collide });

    // optionally add basemap
    // if (basemaps[query.basemap]) {
    //   let tgBasemap = merge({}, basemaps[query.basemap]({ labelsOnTop })); // copy basemap settings
    //   if (query.basemap_api_key) {
    //     tgBasemap.global = tgBasemap.global || {};
    //     tgBasemap.global.sdk_api_key = query.basemap_api_key;
    //   }

    //   // merge XYZ scene and basemap
    //   // create a new scene object to make sure import/global keys at top (js-yaml processes in insertion order)
    //   scene = merge({}, tgBasemap, scene);
    // }

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
}
