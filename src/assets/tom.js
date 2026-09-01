(function () {
  let fishCount = 0;
  let hideTimer;

  const phrases = [
    "Polos peixiños que che demos, Tom 🐟💙",
    "Miau! Grazas pola marea 🌊",
    "Sempre ao noso carón 🐾",
    "O mellor compañeiro de pesca ✨",
  ];

  document.addEventListener("click", (event) => {
    const avatar = event.target.closest("#tom-avatar");
    if (!avatar) return;

    const dialog = document.getElementById("tom-dialog");
    fishCount++;

    avatar.classList.remove("tom-eating");
    void avatar.offsetWidth;
    avatar.classList.add("tom-eating");

    const rect = avatar.getBoundingClientRect();
    const fish = document.createElement("span");
    fish.className = "pixel-fish";
    fish.style.left = rect.left + 16 + "px";
    fish.style.top = rect.top - 8 + "px";
    document.body.appendChild(fish);
    setTimeout(() => fish.remove(), 500);

    if (dialog) {
      clearTimeout(hideTimer);
      if (fishCount === 1) {
        dialog.textContent = "Polos peixiños que che demos, Tom 🐟💙";
      } else {
        const rand = phrases[Math.floor(Math.random() * phrases.length)];
        dialog.textContent = `${rand} (+${fishCount} 🐟)`;
      }
      dialog.classList.add("active");

      hideTimer = setTimeout(() => {
        dialog.classList.remove("active");
      }, 3000);
    }
  });
})();
