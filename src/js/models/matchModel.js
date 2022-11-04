const callbacks = {
  matchResult: (obj) => {},
};
function deepCopyObject(inObject) {
  let outObject, value, key;
  if (typeof inObject !== "object" || inObject === null) {
    return inObject;
  }
  outObject = Array.isArray(inObject) ? [] : {};
  for (key in inObject) {
    value = inObject[key];
    outObject[key] =
      typeof value === "object" && value !== null
        ? deepCopyObject(value)
        : value;
  }
  return outObject;
}

function pushIfNotExist(arr, obj) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].num === obj.num) {
      return;
    }
  }
  arr.push(obj);
}

function findMatch(moneys, goal) {
  let leftTotalSum = 0;
  moneys.forEach(function (e) {
    leftTotalSum += e.num;
  });
  let target = goal;

  let preArr = [];

  for (let i = 0; i < moneys.length; i++) {
    const newArr = [];
    for (let j = 0; j < preArr.length; j++) {
      if (preArr[j].num + leftTotalSum < target) {
        continue;
      }

      pushIfNotExist(newArr, preArr[j]);

      if (preArr[j].num >= target) {
        break;
      }

      const newNum = deepCopyObject(preArr[j]);
      newNum.num += moneys[i].num;
      newNum.list.push(moneys[i]);
      pushIfNotExist(newArr, newNum);
    }

    if (leftTotalSum >= target) {
      pushIfNotExist(newArr, { num: moneys[i].num, list: [moneys[i]] });
    }

    leftTotalSum -= moneys[i].num;

    preArr = newArr;
    preArr.sort(function (a, b) {
      return a.num - b.num;
    });
  }
  let min = 9876543210;
  let minId = -1;
  let smin = 9876543210;
  let sminId = -1;
  for (let i = 0; i < preArr.length; i++) {
    const diff = Math.abs(preArr[i].num - target);
    if (diff < min) {
      smin = min;
      sminId = minId;
      min = diff;
      minId = i;
    } else if (diff < smin) {
      smin = diff;
      sminId = i;
    }
  }
  const minobj = {};
  if (minId !== -1) {
    minobj.num = preArr[minId].num;
    minobj.arr = preArr[minId].list;
  }

  const secondMinobj = {};
  if (sminId !== -1) {
    secondMinobj.num = preArr[sminId].num;
    secondMinobj.arr = preArr[sminId].list;
  }
  callbacks.matchResult({
    goal: target,
    min: minobj,
    secondMin: secondMinobj,
  });
}

export default {
  setCallback: (name, func) => (callbacks[name] = func),
  findMatch: findMatch,
};
