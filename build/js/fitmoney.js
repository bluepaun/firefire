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
      pushIfNotExist(newArr, {
        num: moneys[i].num,
        list: [moneys[i]]
      });
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
const GOAL_STRING = "현재목표 돈";
const callbacks = {
  runMatch: (moneys, goal) => {}
};
let goal = parseInt(goalInput.value);
let moneys = [];
goalInput.addEventListener("change", () => {
  goal = parseInt(goalInput.value);
  displayGoalh3.innerText = `${GOAL_STRING} : ${goal.toLocaleString("en-US")}`;
});
moneyForm.addEventListener("submit", e => {
  e.preventDefault();
  const target = e.target;
  const input = target.querySelector("input");
  if (!isNaN(parseInt(input.value))) {
    addList(parseInt(input.value));
  }
  input.value = "";
});
moneysForm.addEventListener("submit", e => {
  e.preventDefault();
  const target = e.target;
  const textarea = target.querySelector("textarea");
  console.log(textarea.value);
  const str = textarea.value;
  textarea.value = "";
  const filteredArr = str.split(/\r?\n/).filter(function (e) {
    const t = parseInt(e);
    if (t !== 0 && isNaN(t) === false) {
      return t;
    }
  });
  filteredArr.forEach(function (e) {
    const t = parseInt(e);
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
  console.log(arr);
  const lis = displayUl.querySelectorAll("li");
  lis.forEach(li => {
    const delbtn = li.querySelector("button");
    const id = parseInt(delbtn.dataset.id);
    console.log(id);
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id === id) {
        console.log("click", id);
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
  h4.innerText = `${g.toLocaleString("en-US")}원과 제일 가까운 값 : ${num.toLocaleString("en-US")}`;
  const btn = document.createElement("button");
  btn.innerText = "한번에 목록에서 지우기";
  btn.addEventListener("click", e => {
    const p = e.target.parentNode;
    const lis = p.querySelectorAll("li");
    const delArr = [];
    lis.forEach(l => {
      const moneyobj = {};
      moneyobj.num = parseInt(l.innerText);
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
    noResult.innerText = `돈의 총합이 ${g.toLocaleString("en-US")}원을 넘지 않아 가까운 값을 찾을 수 없습니다.`;
    resultDiv.appendChild(noResult);
    return;
  }
  const {
    num,
    arr
  } = match;
  console.log(g, num, arr);
  const reDiv = createResultDiv(g, num, arr);
  resultDiv.appendChild(reDiv);
}
var _default = {
  setCallback: (name, func) => callbacks[name] = func,
  showResult: showResult
};
exports.default = _default;

},{}]},{},[1]);
