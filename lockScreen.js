const target = new Date("2025-07-24T00:00:00+07:00").getTime();
const timerEl = document.getElementById("timer");
const btn = document.getElementById("enterBtn");

const updateCountdown = () => {
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
        timerEl.innerHTML = "00:00:00";
        btn.style.display = "inline-block";
        document.querySelector(".lock-msg").innerText = "Đã sẵn sàng mở cửa rồi!";
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    timerEl.innerHTML =
        (days > 0 ? `${days} ngày ` : "") +
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};


updateCountdown();
setInterval(updateCountdown, 1000);