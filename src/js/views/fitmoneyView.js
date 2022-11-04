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
  runMatch: (moneys, goal) => {},
};

let goal = parseInt(goalInput.value);
let moneys = [];

goalInput.addEventListener("change", () => {
  goal = parseInt(goalInput.value);
  displayGoalh3.innerText = `${GOAL_STRING} : ${goal.toLocaleString("en-US")}`;
});

moneyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const target = e.target;
  const input = target.querySelector("input");
  if (!isNaN(parseInt(input.value))) {
    addList(parseInt(input.value));
  }
  input.value = "";
});

moneysForm.addEventListener("submit", (e) => {
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
  moneys.push({ id, num });
  showLi(id, num);
}

function delList(id) {
  const index = moneys.findIndex((e) => e.id === id);
  moneys.splice(index, 1);
}

function createLi(id, num) {
  const li = document.createElement("li");
  const span = document.createElement("span");
  const btn = document.createElement("button");
  btn.innerText = "X";
  btn.dataset.id = id;
  btn.addEventListener("click", (e) => {
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
  lis.forEach((li) => {
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
  h4.innerText = `${g.toLocaleString(
    "en-US"
  )}원과 제일 가까운 값 : ${num.toLocaleString("en-US")}`;
  const btn = document.createElement("button");
  btn.innerText = "한번에 목록에서 지우기";
  btn.addEventListener("click", (e) => {
    const p = e.target.parentNode;
    const lis = p.querySelectorAll("li");
    const delArr = [];
    lis.forEach((l) => {
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
  arr.forEach((mon) => {
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
    noResult.innerText = `돈의 총합이 ${g.toLocaleString(
      "en-US"
    )}원을 넘지 않아 가까운 값을 찾을 수 없습니다.`;
    resultDiv.appendChild(noResult);
    return;
  }
  const { num, arr } = match;
  console.log(g, num, arr);
  const reDiv = createResultDiv(g, num, arr);
  resultDiv.appendChild(reDiv);
}

export default {
  setCallback: (name, func) => (callbacks[name] = func),
  showResult: showResult,
};
