import responseFactory from './response';
import routeFactory from './route';
import controllerFactory from './controller';

/**
 * Regex to match urls ending with "?args=value" and to make it
 * match precise routes.
 * See https://github.com/Rewieer/faussaire/issues/1
 *
 * @type {string}
 */
const URLArgsRegex = "((\\?)([^=]+)(=(.+))?)?$";

/**
 * Return true if the url is matching the route
 *
 * @param route
 * @param url
 * @returns {boolean}
 */
const isMatching = (route, url) => {
  const urlRegex = route.replace(/{(\w)+}/g, "(.+)") + URLArgsRegex;
  return new RegExp(urlRegex).test(url);
};

/**
 * Extract all the arguments from the parameters, following the ? in the URL
 * @param url
 * @returns {{}}
 */
const extractURLArgs = (url) => {
  var str = url.split('?'),
      obj = {}
  ;

  if(str[1]){
    var pairs = str[1].split('&');

    if(pairs.length === 0){
      return obj;
    }

    [].slice.call(pairs).forEach(function(pair){
      var keyValue = pair.split("=");
      obj[keyValue[0]] = keyValue[1];
    });

    return obj;
  }

  return {};
};

/**
 * Extract routing parameters
 *
 * From template such as http://url.com/post/{id}
 * with url such as http://url.com/post/3
 * This function will match ID with the value 3.
 *
 * @param template
 * @param url
 * @returns {{}}
 */
const extractRouteParameters = function(template, url){
  var keys = [];

  var urlRegex = template.replace(/{(\w)+}/g, function(arg){
    keys.push(arg.substr(1, arg.length - 2));
    return "([^?]+)";
  });

  var regex = new RegExp(urlRegex);
  var routeArgs = regex.exec(url);

  var obj = {};
  [].slice.call(routeArgs, 1).forEach(function(t, i){
    obj[keys[i]] = t;
  });

  return obj;
};

const extractURLArgs = (url) => {
  var argSection = url.split('?');
  if(argSection[1]){
    var argPairs = argSection[1].split('&');

    if(argPairs.length === 0){
      return {};
    }

    var obj = {};
    [].slice.call(argPairs).forEach(function(argPair){
      var keyValue = argPair.split("=");
      obj[keyValue[0]] = keyValue[1];
    });

    return obj;
  }

  return {};
};

/**
 * Create a faussaire instance
 *
 * @returns {Object}
 */
const createFaussaire = () => {

  var _routes = [];
  var _onNotFoundError = responseFactory({
    data: {},
    status: 404,
    statusText: "Route not found.",
    headers: {}
  });

  const faussaire = {
    /**
     * Add a route to faussaire
     *
     * @param route ({
     *  template => string,
     *  methods => array,
     *  controller => {
     *    authenticate(params, options),
     *    run(params, options)
     *  }
     * })
     * A route is represented by a template and the HTTP methods.
     *
     * A controller is called once the associated route match.
     * The authenticate method allows to return a token to be passed in the option
     * object for the next run call.
     *
     * The run function is the only one to be able to return a response, which is an object
     * corresponding to the response object definition (see response.js)
     */
    route: (route) => {
      _routes.push(route);
      return faussaire;
    },

    /**
     * Fetch the data synchronously.
     * @param url
     * @param method
     * @param requestBody
     * @returns response
     */
    fetch: (url, method, requestBody) => {
      for(var i = 0; i < _routes.length; i++){

        if(!isMatching(_routes[i].template, url)) {
          continue;
        }

        // Checking if the method matches the routes
        if(_routes[i].methods.indexOf(method.toUpperCase()) < 0){
          continue;
        }

<<<<<<< HEAD
        var query = [], request = [];
=======
        var query   = [],
            request = [],
            route   = extractRouteParameters(_routes[i].template, url)
          ;
>>>>>>> 14184140cb9501e1b6aee547b3b65fada27cba80

        // In GET methods, there's no need to read request's body
        // If there is a requestBody in the fetch, the user still probably
        // Wants them to be considered as query parameters
        if(method === "GET"){
          query = Object.assign({}, extractURLArgs(url), requestBody);
          request = [];
        } else {
          query = extractURLArgs(url);
          request = requestBody;
        }

        const params = {
          query,
<<<<<<< HEAD
          request
=======
          request,
          route
>>>>>>> 14184140cb9501e1b6aee547b3b65fada27cba80
        };

        // Object holding data about the process
        const options = {
          method
        };

        if(typeof _routes[i].controller.authenticate === 'function'){
          const token = _routes[i].controller.authenticate(params, options);

          if(typeof token !== 'undefined'){
            options.token = token;
          }
        }

        return _routes[i].controller.run(params, options);
      }

      return _onNotFoundError;
    },

    onNotFoundError: response => { _onNotFoundError = response; }
  };

  return faussaire;
};

export default createFaussaire();
export const Route = routeFactory;
export const Controller = controllerFactory;
export const Response = responseFactory;