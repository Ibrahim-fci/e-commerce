const converter = async (arr: []) => {
  console.log(arr, "arr");
  if (!arr) return [];
  try {
    let temp: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      if (!parseInt(arr[i])) continue;
      temp.push(parseInt(arr[i]));
    }

    if (temp.length == 0) return [];
    return temp;
  } catch {
    return [];
  }
};

export default converter;
