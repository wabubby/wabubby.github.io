
document.addEventListener("mousemove", (e) => {
    const bg = document.getElementById("home-banner-bg");
    if (!bg) return;

    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    const strength = 50;

    const moveX = (x - 0.5) * strength * -1;
    const moveY = (y - 0.5) * strength * -1;

    bg.style.transform = `translate(${moveX}px, ${moveY}px)`;

    console.log(`Mouse X: ${e.clientX}, Mouse Y: ${e.clientY}, MoveX: ${moveX}, MoveY: ${moveY}`);
});
