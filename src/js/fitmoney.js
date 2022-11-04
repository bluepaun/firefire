import view from "./views/fitmoneyView.js";
import match from "./models/matchModel.js";

view.setCallback("runMatch", (moneys, goal) => {
  match.findMatch(moneys, goal);
});

match.setCallback("matchResult", (res) => {
  const { goal, min, secondMin } = res;
  if (Object.keys(min).length === 0 && Object.keys(secondMin).length === 0) {
    view.showResult(goal);
  }
  if (Object.keys(min).length !== 0) {
    view.showResult(goal, min);
  }
  if (Object.keys(secondMin).length !== 0) {
    view.showResult(goal, secondMin);
  }
});
