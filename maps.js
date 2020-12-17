'use strict'

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
  

  
const oneRouteMap = [
  {
      "routeId": "Cross-Town Express",
      "stopIds": [ "A", "B", "C", "D", "E", "F", "G", "H", "I", "J" ],
      "departureTimes": [ 0, 5 ]
  }
]
  
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

module.exports = {
  MULTI_ROUTE: multiRouteMap,
  MUNI: muni,
  ONE_ROUTE: oneRouteMap
}
