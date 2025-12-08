
// // function to format time in cooly :)
// function formatTime(seconds) {
//     function formatDouble(num) {
//         return `${num<=9 ? '0' : ''}${num}`
//     }
    
//     const hrs = Math.floor(seconds/60/60);
//     const mins = Math.floor(seconds/60) % 60;
//     const secs = seconds % 60;
    
//     if (hrs > 0) {
//         return `${hrs}:${formatDouble(mins)}:${formatDouble(secs)}`;
//     } else {
//         return `${mins}:${formatDouble(secs)}`;
//     }
// }

// let secondsElapsed = 0;

// console.log("starting timer...")

// // update that timer!
// setInterval(() => {
//     secondsElapsed += 1;
//     document.getElementById("timer").innerText = formatTime(secondsElapsed);
// }, 1000)
