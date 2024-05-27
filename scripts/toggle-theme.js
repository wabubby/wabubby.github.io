
var themes = ["theme-work", "theme-necess", "theme-break", "theme-sleep"]

function resetTheme() {
  const temp = document.body.classList;
  themes.forEach((theme) => {
    if (temp.contains(theme)) { temp.remove(theme) }
  })
}

function switchWorkTheme(themeClass) {
  resetTheme();
  
  document.body.classList.add(themeClass); // Switch to the dark theme
}

document.getElementById("work").addEventListener("click", () => switchWorkTheme("theme-work"));
document.getElementById("necess").addEventListener("click", () => switchWorkTheme("theme-necess"));
document.getElementById("break").addEventListener("click", () => switchWorkTheme("theme-break"));
document.getElementById("sleep").addEventListener("click", () => switchWorkTheme("theme-sleep"));
