async function convertStrArrToIntArr(stringArray: []) {
  if (!stringArray) return [];

  // Create an empty array of number
  const numberArray = [];

  length = stringArray.length;

  for (var i = 0; i < length; i++) numberArray.push(parseInt(stringArray[i]));

  return numberArray;
}

export { convertStrArrToIntArr };
