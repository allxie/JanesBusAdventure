'use strict'

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
*/
const distinct = (array) => array.filter((value, index, self) => self.indexOf(value) === index)

module.exports = {
  getAllIndices,
  distinct
}