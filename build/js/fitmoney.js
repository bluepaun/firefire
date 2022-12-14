(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _fitmoneyView = _interopRequireDefault(require("./views/fitmoneyView.js"));
var _matchModel = _interopRequireDefault(require("./models/matchModel.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
_fitmoneyView.default.setCallback("runMatch", (moneys, goal) => {
  _matchModel.default.findMatch(moneys, goal);
});
_matchModel.default.setCallback("matchResult", res => {
  const {
    goal,
    min,
    secondMin
  } = res;
  if (Object.keys(min).length === 0 && Object.keys(secondMin).length === 0) {
    _fitmoneyView.default.showResult(goal);
  }
  if (Object.keys(min).length !== 0) {
    _fitmoneyView.default.showResult(goal, min);
  }
  if (Object.keys(secondMin).length !== 0) {
    _fitmoneyView.default.showResult(goal, secondMin);
  }
});

},{"./models/matchModel.js":2,"./views/fitmoneyView.js":3}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const callbacks = {
  matchResult: obj => {}
};
function deepCopyObject(inObject) {
  let outObject, value, key;
  if (typeof inObject !== "object" || inObject === null) {
    return inObject;
  }
  outObject = Array.isArray(inObject) ? [] : {};
  for (key in inObject) {
    value = inObject[key];
    outObject[key] = typeof value === "object" && value !== null ? deepCopyObject(value) : value;
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
        data: moneys[i]
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
    secondMin: secondMinobj
  });
}
var _default = {
  setCallback: (name, func) => callbacks[name] = func,
  findMatch: findMatch
};
exports.default = _default;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const goalInput = document.getElementById("goal");
const moneyForm = document.querySelector(".moneyForm");
const moneysForm = document.querySelector(".moneysForm");
const displayBox = document.querySelector(".display");
const displayGoalh3 = displayBox.querySelector("h3");
const displayUl = displayBox.querySelector("ul");
const displayDelBtn = displayBox.querySelector("#deleteAll");
const runBtn = displayBox.querySelector("#run");
const resultBox = document.querySelector(".resultDisplay");
const resultDiv = resultBox.querySelector("div");
const GOAL_STRING = "???????????? ???";
const callbacks = {
  runMatch: (moneys, goal) => {}
};
let goal = Number(goalInput.value);
let moneys = [];
goalInput.addEventListener("change", () => {
  goal = Number(goalInput.value);
  displayGoalh3.innerText = `${GOAL_STRING} : ${goal.toLocaleString("en-US")}`;
});
moneyForm.addEventListener("submit", e => {
  e.preventDefault();
  const target = e.target;
  const input = target.querySelector("input");
  if (input.value !== "" && !isNaN(Number(input.value))) {
    addList(Number(input.value));
  }
  input.value = "";
});
moneysForm.addEventListener("submit", e => {
  e.preventDefault();
  const target = e.target;
  const textarea = target.querySelector("textarea");
  const str = textarea.value;
  textarea.value = "";
  const filteredArr = str.split(/\r?\n/).filter(function (e) {
    const t = Number(e);
    if (t !== 0 && isNaN(t) === false) {
      return t;
    }
  });
  filteredArr.forEach(function (e) {
    const t = Number(e);
    addList(t);
  });
});
let idCnt = 0;
function addList(num) {
  idCnt++;
  const id = idCnt;
  moneys.push({
    id,
    num
  });
  showLi(id, num);
}
function delList(id) {
  const index = moneys.findIndex(e => e.id === id);
  moneys.splice(index, 1);
}
function createLi(id, num) {
  const li = document.createElement("li");
  const span = document.createElement("span");
  const btn = document.createElement("button");
  btn.innerText = "X";
  btn.dataset.id = id;
  btn.addEventListener("click", e => {
    const delId = parseInt(e.target.dataset.id);
    delList(delId);
    const cli = e.target.parentNode;
    cli.remove();
  });
  span.innerText = `money : ${num}    `;
  li.appendChild(span);
  li.appendChild(btn);
  return li;
}
function showLi(id, num) {
  const li = createLi(id, num);
  displayUl.appendChild(li);
}
displayDelBtn.addEventListener("click", () => {
  idCnt = 0;
  moneys = [];
  displayUl.innerHTML = "";
});
runBtn.addEventListener("click", () => {
  resultDiv.innerHTML = "";
  callbacks.runMatch(moneys, goal);
});
function deleteMoneys(arr) {
  const lis = displayUl.querySelectorAll("li");
  lis.forEach(li => {
    const delbtn = li.querySelector("button");
    const id = parseInt(delbtn.dataset.id);
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id === id) {
        delbtn.click();
        break;
      }
    }
  });
}
function createResultDiv(g, num, arr) {
  const div = document.createElement("div");
  const h4 = document.createElement("h4");
  const ul = document.createElement("ul");
  h4.innerText = `${g.toLocaleString("en-US")}?????? ?????? ????????? ??? : ${num.toLocaleString("en-US")}`;
  const btn = document.createElement("button");
  btn.innerText = "????????? ???????????? ?????????";
  btn.addEventListener("click", e => {
    const p = e.target.parentNode;
    const lis = p.querySelectorAll("li");
    const delArr = [];
    lis.forEach(l => {
      const moneyobj = {};
      moneyobj.num = Number(l.innerText);
      moneyobj.id = parseInt(l.dataset.id);
      delArr.push(moneyobj);
    });
    deleteMoneys(delArr);
    resultDiv.innerHTML = "";
  });
  div.appendChild(h4);
  div.appendChild(btn);
  arr.forEach(mon => {
    const li = document.createElement("li");
    li.innerText = mon.num;
    li.dataset.id = mon.id;
    ul.appendChild(li);
  });
  div.appendChild(ul);
  return div;
}
function showResult(g, match) {
  if (!match) {
    const noResult = document.createElement("h4");
    noResult.innerText = `?????? ????????? ${g.toLocaleString("en-US")}?????? ?????? ?????? ????????? ?????? ?????? ??? ????????????.`;
    resultDiv.appendChild(noResult);
    return;
  }
  const {
    num,
    arr
  } = match;
  const reDiv = createResultDiv(g, num, arr);
  resultDiv.appendChild(reDiv);
}
var _default = {
  setCallback: (name, func) => callbacks[name] = func,
  showResult: showResult
};
exports.default = _default;

},{}]},{},[1]);
