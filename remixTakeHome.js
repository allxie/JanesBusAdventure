/////// UTILS //////

/**
 * gets all of the indices for an item in an array
 */
const getAllIndices = (arr, val) => {
    const indices = [];
    for(let i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
          indices.push(i);
        }
    }
    return indices;
};

/**
 * Returns distinct values in an array
 * (Would have probably normally done this with lodash)
 */
const distinct = (array) => array.filter((value, index, self) => self.indexOf(value) === index)

/**
 * Gets an object with each stop as a key, and an array of lines as the value
 *
 * @param {objct} busMap
 * @returns {object} - object with each stop as a key, and an array of lines as the value
 */
const getMapOfRoutesByStop = (busMap) => {
  const routesByStop = {};

  // iterate through routes
  for(let i = 0; i < busMap.length; i++) {
    const route = busMap[i];
    const routeStops = distinct(route.stopIds);
    // iterate through distinct stops in a route
    for(let j = 0; j < routeStops.length; j++) {
      const stop = routeStops[j];
      if(routesByStop[stop]) {
        routesByStop[stop].push(route.routeId);
      } else {
        routesByStop[stop] = [route.routeId];
      }
    }
  }

  return routesByStop;
}

/**
 * Returns the earliest time the passenger could get picked up from her origin station
 * This also factors in the direction by specifying not just the stopId but the index in the route
 * 
 * Note: this only handles one route at a time.
 * 
 * @param {number} startTime
 * @param {array} departureTimes
 * @param {number} originBusStopIndex
 */
const getEarliestDepartureTime = (startTime, departureTimes, originBusStopIndex) => {
  for(let i = 0; i < departureTimes.length; i++) {
    const departureTime = departureTimes[i];

    if(departureTime + originBusStopIndex >= startTime) {
      return departureTime + originBusStopIndex;
    }
  }
  return null;
}

const getRouteById = (routeId, map) => map.find((route) => route.routeId === routeId);

const getAccessibleRoutes = ({originId, startTime, endTime, map}) => {
  const routesByStop = getMapOfRoutesByStop(map);
  const reachableStops = [];
  traverseMapForAccessibleRoutes({
        reachableStops,
        originId,
        startTime,
        endTime,
        map,
        routesByStop
  });

  return distinct(reachableStops);
};

/**
 * Recurses through the bus map to find all accessible bus stops. Mutates the reachableStops array for results.
 * 
 * @param {object} params
 * @param {array} params.reachableStops - this holds the stops the passenger can visit
 * @param {string} params.originId - stopId of the bus stop to start from
 * @param {object} params.routeId - a bus route object with stopIds, routeId, and departureTimes
 * @param {array} params.map - JSON bus map
 * @param {object} params.routesByStop - a memo of the bus map with stopIds as keys and an array of routes that go through those stops as value
 * @param {number} params.startTime - first viable bus station departure time from the originIndex
 * @param {number} params.endTime - last viable bus station arrival time
 * @param {number} [params.originIndex] - optional - index in the provided route's stopIds that the given originId occurs. This implies a direction, unlike originId
 */
const traverseMapForAccessibleRoutes = (params) => {
  // Given a stop, we may not know what route that stop belongs to, and it might belong to many!
  // If there's no route passed in, find out how many routes intersect with the stop
  // an recurse for each of those routes.
  if(!params.routeId) {
    const routeIdsForOriginStop = params.routesByStop[params.originId];
    
    return routeIdsForOriginStop.forEach((routeId) => {
      traverseMapForAccessibleRoutes({
        ...params,
        routeId
      });
    })
  }

  const route = getRouteById(params.routeId, params.map);

  // If originIndex is undefined and there are multiple instances of the origin stop in the route,
  // that means the passenger could wait and go either direction on the line and we need to handle both!
  // Recurse with each originIndex to handle multi-directions
  if(typeof params.originIndex !== 'number') {
    const indicesOfOriginStop = getAllIndices(route.stopIds, params.originId);

    return indicesOfOriginStop.forEach((index) => {
      traverseMapForAccessibleRoutes({
        ...params,
        originIndex: index
      })
    });
  }

  // Determine what time the person could leave the station soonest from the originIndex
  const departureTimes = route.departureTimes;
  const earliestDepartureTime = getEarliestDepartureTime(params.startTime, departureTimes, params.originIndex);
  let departureTime = typeof earliestDepartureTime === 'number' ? earliestDepartureTime : params.endTime

  // Iterate down the route recording stops into reachableStops
  // until running out of time, stops, or reaching a "hub"
  let newIndex = params.originIndex
  while(
    departureTime <= params.endTime
    && newIndex < route.stopIds.length
  ) {
    const stopId = route.stopIds[newIndex];
    // "hubs" are stations with more than one route going through them.
    // If the stop is a hub, we need to explore all of the directions.
    // To do this, we recurse, wiping the route and originIndex
    // so that the directions and routes can be re-triaged 
    const isStopHub = params.routesByStop[stopId].length > 1;

    if(isStopHub && newIndex !== params.originIndex) {

      return traverseMapForAccessibleRoutes({
        ...params,
        originIndex: null,
        originId: stopId,
        startTime: departureTime,
        routeId: null
      });
    } else {
      params.reachableStops.push(stopId);
      departureTime++;
      newIndex++;
    }
  }
};

const oneRouteMap = [
    {
        "routeId": "Cross-Town Express",
        "stopIds": [ "A", "B", "C", "D", "E", "F", "G", "H", "I", "J" ],
        "departureTimes": [ 0, 5 ]
    }
]

// getAccessibleRoutes({
//   originId: "A",
//   startTime: 0,
//   endTime: 5,
//   map: oneRouteMap
// }) // --> ["A", "B", "C", "D", "E", "F"]
// getAccessibleRoutes({
//   originId: "C",
//   startTime: 3,
//   endTime: 8,
//   map: oneRouteMap
// }) // --> ["C", "D"]

// getAccessibleRoutes({
//   originId: "A",
//   startTime: 6,
//   endTime: 9,
//   map: oneRouteMap
// })// --> ["A"] 
// I added a testcase for when Jane can't get on a bus

const multiRouteMap = [
  {
    "routeId": "H1",
    "stopIds": ["E", "F", "G", "H", "I", "J", "K", "J", "I", "H", "G", "F", "E"],
    "departureTimes": [0, 10]
  },
  {
    "routeId": "H2",
    "stopIds": ["T", "S", "R", "Q", "P", "O", "N", "O", "P", "Q", "R", "S", "T"],
    "departureTimes": [0, 10]
  },
  {
    "routeId": "V1",
    "stopIds": ["A", "C", "G", "L", "P", "U", "W", "U", "P", "L", "G", "C", "A"],
    "departureTimes": [5, 15]
  },
  {
    "routeId": "V2",
    "stopIds": ["X", "V", "R", "M", "I", "D", "B", "D", "I", "M", "R", "V", "X"],
    "departureTimes": [5, 15]
  }
]
// getAccessibleRoutes({
//   originId: "E",
//   startTime: 0,
//   endTime: 8,
//   map: multiRouteMap 
// })
//E, F, G, H, I, J, K, and L

// getAccessibleRoutes({
//   originId: "G",
//   startTime: 3,
//   endTime: 15,
//   map: multiRouteMap 
// })
// E, F, G, H, I, J, L, O, P, U, and W.

// getAccessibleRoutes({
//   originId: "L",
//   startTime: 0,
//   endTime: 20,
//   map: multiRouteMap 
// })
// A, C, G, L, N, O, P, Q, R, U, and W

// getAccessibleRoutes({
//   originId: "Q",
//   startTime: 5,
//   endTime: 18,
//   map: multiRouteMap 
// })
// M, N, O, P, Q, R, S, T, V, and X

const muni = [
  {
    "routeId": "N Judah",
    "stopIds": ["Ocean Beach", "Van Ness", "Civic Center", "Powell", "Montgomery", "Embarcadero", "Caltrain & Ballpark", "Embarcadero", "Montgomery", "Powell", "Civic Center", "Van Ness", "Ocean Beach"],
    "departureTimes": [0, 20, 40]
  },
  {
    "routeId": "L Taraval",
    "stopIds": ["SF Zoo", "West Portal", "Forest Hill", "Castro", "Van Ness", "Civic Center", "Powell", "Montgomery", "Embarcadero", "Montgomery", "Powell", "Civic Center", "Van Ness", "Castro", "Forest Hill", "West Portal", "SF Zoo"],
    "departureTimes": [0, 5, 10, 20]
  },
  {
    "routeId": "M",
    "stopIds": ["SF State", "West Portal", "Forest Hill", "Castro", "Van Ness", "Civic Center", "Powell", "Montgomery", "Embarcadero", "Montgomery", "Powell", "Civic Center", "Van Ness", "Castro", "Forest Hill", "West Portal", "SF State"],
    "departureTimes": [0, 5]
  },
]

// test case for 3+ bus routes
getAccessibleRoutes({
  originId: "Ocean Beach",
  startTime: 0,
  endTime: 20,
  map: muni
})
