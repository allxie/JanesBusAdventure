'use strict'
/*
  Bus Route Planner
  Remix Takehome Assignment for Engineering Manager Role
  Allxie Cleary
  12/16/20


  Here are some assumptions I made, though in an in-person interview I would have clarified.
  Assumptions:
  1.) "Time" does not loop. Jane cannot wait "overnight" between the max time and 0.
  2.) We don't care in what order the stops should be returned
  3.) Stops shouldn't be returned multiple times even if Jane could go there twice
  4.) Not supposed to use external libs like lodash

*/

const routePlannerUtils = require('./routePlannerUtils')
const utils = require('./utils')
const {MUNI, ONE_ROUTE, MULTI_ROUTE } = require('./maps')

/**
 * The passenger has a specific route and direction (implied by originIndex), and this function
 * goes down that route in that direction adding possible stops until the passenger hits a "hub",
 * at which time we recurse back into exploreInAllDirections()
 * 
 * @param {object} params 
 * @param {string} params.routeId - what route the passenger is traveling on
 * @param {number} params.originIndex - what index in the route's stopIds array is the stop the passenger starts from
 * @param {number} params.startTime - time the passenger arrives at the originIndex
 * @param {number} params.endTime - last time when a passenger can arrive at a stop
 * @param {object} params.map - bus map
 * @param {object} params.memo - object to record previously explored stop/route/time combos
 * @param {array} params.reachableStops - this holds the stops the passenger can visit
 */
const exploreInOneDirection = (params) => {
  const route = params.map.find((route) => route.routeId === params.routeId);

  // Determine what time the passenger could leave the station soonest from the originIndex
  const departureTimes = route.departureTimes;
  const earliestDepartureTime = routePlannerUtils.getEarliestDepartureTime(params.startTime, departureTimes, params.originIndex);
  let departureTime = typeof earliestDepartureTime === 'number' ? earliestDepartureTime : params.endTime;

  // Iterate down the route recording stops into reachableStops
  // until running out of time, stops, or reaching a "hub"
  let newIndex = params.originIndex;

  while(
    departureTime <= params.endTime
    && newIndex < route.stopIds.length
  ) {
    const stopId = route.stopIds[newIndex];

    // "Hubs" are stations with more than one route going through them.
    // If the stop is a hub, we need to explore all of the directions.
    // To do this, we recurse, wiping the route and originIndex
    // so that the directions and routes can be re-triaged 
    const isStopHub = routePlannerUtils.getRoutesByStopId(params.map, stopId).length > 1;
    if(isStopHub && newIndex !== params.originIndex) {

      return exploreInAllDirections({
        ...params,
        originId: stopId,
        startTime: departureTime,
      });
    } else {
      params.reachableStops.push(stopId);
      departureTime++;
      newIndex++;
    }
  }
}

/**
 * Triages a bus stopId/time combination from which a passenger might go in multiple directions or routes.
 * 
 * @param {object} params 
 * @param {object} params.map - bus map
 * @param {string} params.originId - starting stopId from which to explore in all directions
 * @param {number} params.startTime - time the passenger can first start exploring from the stop
 * @param {number} params.endTime - last time when a passenger can arrive at a stop
 * @param {object} params.memo - object to record previously explored stop/route/time combos
 * @param {array} params.reachableStops - this holds the stops the passenger can visit
 */
const exploreInAllDirections = (params) => {
  const routesIntersectingStop = routePlannerUtils.getRoutesByStopId(params.map, params.originId);
  routesIntersectingStop.forEach(route => {
    const stopIndices = utils.getAllIndices(route.stopIds, params.originId);

    stopIndices.forEach(stopIndex => {
      const previouslyMemoized = routePlannerUtils.upsertRouteStopDepartureMemo(params.memo, route.routeId, stopIndex, params.startTime);
      if(previouslyMemoized) return;

      exploreInOneDirection({
        ...params,
        routeId: route.routeId,
        originIndex: stopIndex
      });
    }) 
  })
}

/**
 *     _____________
 *   _/_|[][][][][] | - -
 *  (      City Bus | - -
 *  =--OO-------OO--=dwb
 * Welcome to the Bus Route Planner! I don't know who this Jane lady is,
 * but she's a high functioning busy person, and we're here to help her!
 * This function is the entrypoint to the planner.
 * 
 * @param {string} originId - id of the bus stop where passenger starts
 * @param {number} startTime - time unit when passenger gets to first bus stop
 * @param {number} endTime - last time when a passenger can arrive at a stop
 * @param {object} map - city map with bus routes
 */
const getAccessibleRoutes = ({originId, startTime, endTime, map}) => {
  const reachableStops = [];
  const memo = {};

  exploreInAllDirections({
        reachableStops,
        originId,
        startTime,
        endTime,
        map,
        memo
  });

  return utils.distinct(reachableStops);
};

/* ----------------------------
  Test Cases
---------------------------- */

console.log(getAccessibleRoutes({
  originId: "A",
  startTime: 0,
  endTime: 5,
  map: ONE_ROUTE
}));
// --> ["A", "B", "C", "D", "E", "F"]
console.log(getAccessibleRoutes({
  originId: "C",
  startTime: 3,
  endTime: 8,
  map: ONE_ROUTE
}));
// --> ["C", "D"]
  
console.log(getAccessibleRoutes({
  originId: "A",
  startTime: 6,
  endTime: 9,
  map: ONE_ROUTE
})); 
// --> ["A"] 
// Additional testcase for when Jane can't get on a bus since she should still get to "A"

console.log(getAccessibleRoutes({
  originId: "E",
  startTime: 0,
  endTime: 8,
  map: MULTI_ROUTE 
})); 
//E, F, G, H, I, J, K, and L

console.log(getAccessibleRoutes({
  originId: "G",
  startTime: 3,
  endTime: 15,
  map: MULTI_ROUTE 
}));
// E, F, G, H, I, J, L, O, P, U, and W.

console.log(getAccessibleRoutes({
  originId: "L",
  startTime: 0,
  endTime: 20,
  map: MULTI_ROUTE 
}));
// A, C, G, L, N, O, P, Q, R, U, and W

console.log(getAccessibleRoutes({
  originId: "Q",
  startTime: 5,
  endTime: 18,
  map: MULTI_ROUTE 
}));
// M, N, O, P, Q, R, S, T, V, and X

// Jane wanted to visit a city with N bus routes, so she picked SF because of the famous Muni 🧐.
// Because of COVID, only 3 routes were running, but Jane rode them all and could have planned
// her trip with the Bus Route Planner performantly even if all of them were running
console.log(getAccessibleRoutes({
  originId: "Ocean Beach",
  startTime: 0,
  endTime: 20,
  map: MUNI
}));
// "SF State", "West Portal", "Forest Hill", "Castro", "Van Ness", "Civic Center", "Powell", "Montgomery", "Embarcadero", "SF Zoo", "Caltrain & Ballpark"
