// Prevents the page from reloading when "enter" is pressed on the final field of the "survey"

const goalInput = document.getElementById("goal-input");

goalInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    goalInput.blur();
  }
});
