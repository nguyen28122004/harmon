const target = new Date("2024-07-24T00:00:00+07:00").getTime();
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



function showPopup() {
    document.getElementById("passwordPopup").classList.remove("hidden");
    document.querySelector(".pin-input").focus();
}

function closePopup() {
    const popup = document.getElementById("passwordPopup");
    popup.classList.add("popup-hidden");
    setTimeout(() => {
        popup.style.display = "none";
    }, 800); // khớp với thời gian transition

    pins.forEach((pin, i) => {
        pin.value = "";
        stopEggAnimation(canvasIcons[i]);
    });

}

function submitPassword() {
    const correctPassword = "2812";

    const enteredPassword = pins.map(pin => pin.value).join("");

    if (enteredPassword === correctPassword) {
        closePopup();
        window.unlockDoor(); // gọi từ index.js
    } else {
        document.getElementById("errorMsg").style.display = "block";
    }
}


// MÃ PIN
const pins = Array.from(document.querySelectorAll(".pin"));
const canvasIcons = Array.from({ length: 4 }, (_, i) =>
    document.getElementById(`icon${i}`)
);
const sprite = new Image();
sprite.src = "./res/egg-filled.png";

const frameWidth = 96;
const frameHeight = 96;
const totalFrames = 3;
const frameDuration = 150; // ms

function drawEggSprite(canvas, frameIndex) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, frameWidth, frameHeight);
    ctx.drawImage(
        sprite,
        frameIndex * frameWidth,
        0,
        frameWidth,
        frameHeight,
        0,
        0,
        canvas.width,
        canvas.height
    );
}

const activeAnim = {}; // Dùng để quản lý animation per canvas

function playEggAnimation(canvas) {
    const ctx = canvas.getContext("2d");
    let frame = 0;
    let lastFrameTime = 0;

    function animateSprite(timestamp) {
        if (!activeAnim[canvas.id]) return; // Dừng nếu đã bị xoá

        if (timestamp - lastFrameTime > frameDuration) {
            drawEggSprite(canvas, frame);
            frame = (frame + 1) % totalFrames;
            lastFrameTime = timestamp;
        }
        requestAnimationFrame(animateSprite);
    }

    activeAnim[canvas.id] = true;
    requestAnimationFrame(animateSprite);
}

function stopEggAnimation(canvas) {
    activeAnim[canvas.id] = false;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


// Setup input event
pins.forEach((input, index) => {
    input.addEventListener("input", () => {
        const canvas = canvasIcons[index];

        if (input.value) {
            stopEggAnimation(canvas); // Đảm bảo không chạy 2 vòng lặp cùng lúc
            playEggAnimation(canvas);
        } else {
            stopEggAnimation(canvas);
        }

        if (input.value && index < 3) {
            pins[index + 1].focus();
        }
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !input.value && index > 0) {
            pins[index - 1].focus();
        }
    });
});


const inputs = document.querySelectorAll(".pin-input");

inputs.forEach((input, index) => {
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            submitPassword(); // Gọi hàm đã có
        }
    });
});

updateCountdown();
setInterval(updateCountdown, 1000);