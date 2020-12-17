'use strict'

/**
 * Returns an array of routes that intersect with the provided stop
 * @param {object} busMap 
 * @param {string} stopId 
 */
const getRoutesByStopId = (busMap, stopId) => {
  return busMap
  .filter((route) => route.stopIds.indexOf(stopId) !== -1)
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

/**
* Creates a memo of departure times checked for each route/stop/index combo.
* @param {object} memo - object recording route/stop/index combos
* @param {string} routeId - id of the route
* @param {number} stopIndex - index of the stop in the route's stopIds array
* @param {number} departureTime - time when the passenger arrived at the stop to wait for a ride
* @returns {boolean} - true when the item already exists in memo, and false if it was just inserted
*/
const upsertRouteStopDepartureMemo = (memo, routeId, stopIndex, departureTime) => {
  if(!memo[routeId]) {
    memo[routeId] = { [stopIndex]: [departureTime] }
  } else if(!memo[routeId][stopIndex]){
    memo[routeId][stopIndex] = [departureTime]
  } else if(memo[routeId][stopIndex].indexOf(departureTime) === -1){
    memo[routeId][stopIndex].push(departureTime)
  } else {
    return true // memo already exists
  }
  return false
}

module.exports = {
  getRoutesByStopId,
  getEarliestDepartureTime,
  upsertRouteStopDepartureMemo
}