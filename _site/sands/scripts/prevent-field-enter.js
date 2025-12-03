const goalInput = document.getElementById("goal-input");

goalInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    goalInput.blur();
  }
});
