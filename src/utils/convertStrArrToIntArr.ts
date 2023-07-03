const converter = async (arr: []) => {
  let temp: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    temp.push(parseInt(arr[i]));
  }

  if (temp.length == 0) return [];
  return temp;
};

export default converter;
