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

let hashMap = {};

function pushIfNotExist(arr, obj) {
  if (hashMap[obj.num]) {
    return;
  }
  hashMap[obj.num] = obj;
  /* console.log("hashMap", hashMap); */
  arr.push(obj);
}

function getArr(obj) {
  /* console.log("obj", obj); */
  /* console.log("hashMap", hashMap); */
  const arr = [];
  /* arr.push(obj.data); */
  let cur = obj;
  let next = obj.prev;
  arr.push(cur.data);
  while (next > -1) {
    cur = hashMap[next];
    arr.push(cur.data);
    next = cur.prev;
  }

  return arr;
}

function findMatch(moneys, goal) {
  let leftTotalSum = 0;
  hashMap = {};
  moneys.forEach(function (e) {
    leftTotalSum += e.num;
  });
  console.log("moneys lenght", moneys.length);
  console.log("total sum", leftTotalSum);

  moneys.sort((a, b) => {
    return b.num - a.num;
  });

  let target = goal;
  let preArr = [];

  for (let i = 0; i < moneys.length; i++) {
    const newArr = [];
    for (let j = 0; j < preArr.length; j++) {
      if (preArr[j].num + leftTotalSum < target) {
        newArr.push(preArr[j]);
        continue;
      } else {
        newArr.push(preArr[j]);
      }

      if (preArr[j].num >= target) {
        break;
      }

      const newNum = {};
      newNum.prev = preArr[j].num;
      newNum.data = moneys[i];
      newNum.num = preArr[j].num + moneys[i].num;
      pushIfNotExist(newArr, newNum);
    }

    if (leftTotalSum >= target) {
      pushIfNotExist(newArr, {
        num: moneys[i].num,
        prev: -1,
        data: moneys[i],
      });
    }

    leftTotalSum -= moneys[i].num;

    preArr = newArr;
    preArr.sort(function (a, b) {
      return a.num - b.num;
    });
    /* console.log("preArr1", preArr); */

    let exactlyMatch = false;
    for (let idx = 0; idx < preArr.length; idx++) {
      if (preArr[idx].num === target) {
        exactlyMatch = true;
        break;
      }
    }
    if (exactlyMatch) {
      /* console.log("exactlyMatch!!!!"); */
      break;
    }
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
    minobj.arr = getArr(preArr[minId]);
  }
  console.log("minobj", minobj);

  const secondMinobj = {};
  if (sminId !== -1) {
    secondMinobj.num = preArr[sminId].num;
    secondMinobj.arr = getArr(preArr[sminId]);
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
