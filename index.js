const slides = document.querySelectorAll(".slide");
let currentSlide = parseInt(localStorage.getItem("lastSlide")) || 0;;
let isAnimating = false;

const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

function updateNavButtons() {
    prevBtn.style.display = currentSlide === 0 || currentSlide === 14 ? "none" : "block";
    nextBtn.style.display = currentSlide === slides.length - 1 || currentSlide === 12 || currentSlide === 13 ? "none" : "block";
}
let currentBgUrl = ""; // Lưu ảnh hiện tại (rỗng nếu đang dùng màu nền)

function smoothBackgroundChange(newImageUrl = "") {
    const overlay = document.getElementById("bgOverlay");

    if (newImageUrl === currentBgUrl) return;

    // Hiện overlay để fade-out ảnh cũ
    overlay.style.backgroundImage = currentBgUrl ? `url(${currentBgUrl})` : "";
    overlay.style.zIndex = 0;
    overlay.style.opacity = 1;

    setTimeout(() => {
        if (newImageUrl) {
            document.body.style.backgroundImage = `url(${newImageUrl})`;
            document.body.style.backgroundRepeat = "no-repeat";
            document.body.style.backgroundPosition = "center center";
            document.body.style.backgroundAttachment = "fixed";
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundColor = ""; // xóa màu nếu có

            overlay.style.backgroundImage = `url(${newImageUrl})`;
        } else {
            // Xóa ảnh, thay bằng màu
            document.body.style.backgroundImage = "";
            document.body.style.backgroundRepeat = "";
            document.body.style.backgroundPosition = "";
            document.body.style.backgroundAttachment = "";
            document.body.style.backgroundSize = "";
            document.body.style.backgroundColor = "#ffeef2";

            overlay.style.backgroundImage = "";
        }

        overlay.style.opacity = 0;
        currentBgUrl = newImageUrl;
    }, 400);
}


function showSlide(index) {
    sendLogToTelegram(`ĐÃ NHẢY TỚI SLIDE ${index}`)
    if (index < 10 || index > 13)
        smoothBackgroundChange("")
    else if (index > 10) {
        smoothBackgroundChange('./res/beach.jpg');

    } else if (index === 10) {
        smoothBackgroundChange('./res/beach.jpg');
    }

    if (isAnimating || index < 0 || index >= slides.length) return;

    if (index === currentSlide && !slides[index].classList.contains("active")) {
        // Nếu chưa active slide hiện tại thì active nó + apply hiệu ứng vào
        slides[index].classList.add("fade-in");
        slides[index].classList.add("active");
        setTimeout(() => {
            slides[index].classList.remove("fade-in");
            updateNavButtons();
            isAnimating = false;
        }, 400);
        return;
    }

    if (index === currentSlide) return;


    isAnimating = true;

    const current = slides[currentSlide];
    const next = slides[index];

    current.classList.remove("active");
    current.classList.add("fade-out");

    setTimeout(() => {
        current.classList.remove("fade-out");
        next.classList.add("fade-in");
        next.classList.add("active");

        setTimeout(() => {
            next.classList.remove("fade-in");
            currentSlide = index;
            localStorage.setItem("lastSlide", currentSlide); // Lưu slide hiện tại
            updateNavButtons();
            isAnimating = false;
        }, 400);
    }, 400);
}

nextBtn.addEventListener("click", () => showSlide(currentSlide + 1));
prevBtn.addEventListener("click", () => showSlide(currentSlide - 1));

// Canvas sprite animation setup
function setupSpriteAnimation(options) {
    const {
        canvasId,
        imageSrc,
        frameWidth,
        frameHeight,
        columns,
        rows,
        targetRow = 0,
        frameRate = 160
    } = options;

    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const sprite = new Image();
    sprite.src = imageSrc;

    const startFrame = targetRow * columns;
    const endFrame = startFrame + columns - 1;

    let currentFrame = startFrame;
    let lastTime = 0;

    function drawFrame(frame) {
        const col = frame % columns;
        const row = Math.floor(frame / columns);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
            sprite,
            col * frameWidth, row * frameHeight,
            frameWidth, frameHeight,
            0, 0,
            frameWidth, frameHeight
        );
    }

    function animate(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const delta = timestamp - lastTime;

        if (delta > frameRate) {
            drawFrame(currentFrame);
            currentFrame++;
            if (currentFrame > endFrame) currentFrame = startFrame;
            lastTime = timestamp;
        }
        requestAnimationFrame(animate);
    }

    sprite.onload = () => {
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        requestAnimationFrame(animate);
    };
}

// Load slides and animations
Promise.all([

    fetch('slides/lockslide.html').then(res => res.text()).then(data => {
        document.getElementById('lockScreen').innerHTML = data;
        setupSpriteAnimation({
            canvasId: 'mining0',
            imageSrc: 'res/mining.png',
            frameWidth: 622,
            frameHeight: 320,
            columns: 4,
            rows: 1,
            targetRow: 0,
            frameRate: 160
        });

        // Tải js sau khi nội dung slide đã load
        const script = document.createElement('script');
        script.src = 'lockScreen.js';
        script.onload = () => {
            updateCountdown();
            setInterval(updateCountdown, 1000);
        };
        document.body.appendChild(script);
    }),

    fetch('slides/slide1.html').then(res => res.text()).then(data => {
        document.getElementById('slide1').innerHTML = data;
        setupSpriteAnimation({
            canvasId: 'eggmonCanvas1',
            imageSrc: 'res/eggmon10.png',
            frameWidth: 500,
            frameHeight: 500,
            columns: 4,
            rows: 3,
            targetRow: 1,
            frameRate: 160
        });
    }),

    fetch('slides/slide2.html').then(res => res.text()).then(data => {
        document.getElementById('slide2').innerHTML = data;
        setupSpriteAnimation({
            canvasId: 'eggmonCanvas2',
            imageSrc: 'res/duck_walk.png',
            frameWidth: 383,
            frameHeight: 480,
            columns: 15,
            rows: 1,
            frameRate: 50
        });
    }),

    fetch('slides/slide3.html').then(res => res.text()).then(data => {
        document.getElementById('slide3').innerHTML = data;
        setupSpriteAnimation({
            canvasId: 'eggmonCanvas3',
            imageSrc: 'res/eggmon2.png',
            frameWidth: 500,
            frameHeight: 500,
            columns: 4,
            rows: 1,
            frameRate: 160
        });
    }),

    fetch('slides/slide4.html').then(res => res.text()).then(data => {
        document.getElementById('slide4').innerHTML = data;
        setupSpriteAnimation({
            canvasId: 'eggmonCanvas4',
            imageSrc: 'res/eggmon2.png',
            frameWidth: 500,
            frameHeight: 500,
            columns: 4,
            rows: 1,
            frameRate: 160
        });
        setupSpriteAnimation({
            canvasId: 'boxDialogue',
            imageSrc: 'res/boxDialogue.png',
            frameWidth: 152,
            frameHeight: 120,
            columns: 3,
            rows: 1,
            frameRate: 200
        });
    }),

    fetch('slides/slide5.html').then(res => res.text()).then(data => {
        document.getElementById('slide5').innerHTML = data;
        setupSpriteAnimation({
            canvasId: 'eggmonCanvas5',
            imageSrc: 'res/eggmon1.png',
            frameWidth: 500,
            frameHeight: 500,
            columns: 4,
            rows: 1,
            frameRate: 160
        });
        setupSpriteAnimation({
            canvasId: 'rainbow5',
            imageSrc: 'res/rainbow.png',
            frameWidth: 300,
            frameHeight: 300,
            columns: 1,
            rows: 1,
            frameRate: 160
        });
    }),

    fetch('slides/slide6.html').then(res => res.text()).then(data => {
        document.getElementById('slide6').innerHTML = data;
        setupSpriteAnimation({
            canvasId: 'eggmonCanvas6',
            imageSrc: 'res/eggmon3.png',
            frameWidth: 500,
            frameHeight: 500,
            columns: 4,
            rows: 3,
            targetRow: 1,
            frameRate: 160
        });
    }),

    fetch('slides/slide7.html').then(res => res.text()).then(data => {
        document.getElementById('slide7').innerHTML = data;
        setupSpriteAnimation({
            canvasId: 'eggmonCanvas7',
            imageSrc: 'res/eggmon5.png',
            frameWidth: 500,
            frameHeight: 500,
            columns: 4,
            rows: 3,
            targetRow: 1,
            frameRate: 160
        });
    }),

    fetch('slides/slide8.html').then(res => res.text()).then(data => {
        document.getElementById('slide8').innerHTML = data;
        setupSpriteAnimation({
            canvasId: 'eggmonCanvas8',
            imageSrc: 'res/eggmon4.png',
            frameWidth: 500,
            frameHeight: 500,
            columns: 4,
            rows: 3,
            targetRow: 2,
            frameRate: 160
        });
    }),

    fetch('slides/slide9.html').then(res => res.text()).then(data => {
        document.getElementById('slide9').innerHTML = data;
        setupSpriteAnimation({
            canvasId: 'eggmonCanvas9',
            imageSrc: 'res/eggmon7.png',
            frameWidth: 500,
            frameHeight: 500,
            columns: 4,
            rows: 3,
            targetRow: 0,
            frameRate: 160
        });
    }),

    fetch('slides/slide10.html').then(res => res.text()).then(data => {
        document.getElementById('slide10').innerHTML = data;
        setupSpriteAnimation({
            canvasId: 'eggmonCanvas10',
            imageSrc: 'res/eggmon9.png',
            frameWidth: 500,
            frameHeight: 500,
            columns: 4,
            rows: 3,
            targetRow: 1,
            frameRate: 190
        });

        // Tải quiz.js sau khi nội dung slide đã load
        const script = document.createElement('script');
        script.src = 'quiz.js';
        script.onload = () => {
            // Gọi hàm quiz sau khi script được load thành công
            initQuiz();
        };
        document.body.appendChild(script);
    }),

    fetch('slides/slide11.html').then(res => res.text()).then(data => {
        document.getElementById('slide11').innerHTML = data;
        setupSpriteAnimation({
            canvasId: 'eggmonCanvas11',
            imageSrc: 'res/eggmon12.png',
            frameWidth: 500,
            frameHeight: 500,
            columns: 4,
            rows: 3,
            targetRow: 1,
            frameRate: 160
        });
    }),

    fetch('slides/slide12.html').then(res => res.text()).then(data => {
        document.getElementById('slide12').innerHTML = data;
        setupSpriteAnimation({
            canvasId: 'eggmonCanvas12',
            imageSrc: 'res/eggmon12.png',
            frameWidth: 500,
            frameHeight: 500,
            columns: 4,
            rows: 3,
            targetRow: 0,
            frameRate: 160
        });

        setupSpriteAnimation({
            canvasId: 'hamster12',
            imageSrc: 'res/hamster.png',
            frameWidth: 1000,
            frameHeight: 1000,
            columns: 4,
            rows: 1,
            targetRow: 0,
            frameRate: 160
        });
    }),

    fetch('slides/slide13.html').then(res => res.text()).then(data => {
        document.getElementById('slide13').innerHTML = data;
        setupSpriteAnimation({
            canvasId: 'eggmonCanvas13',
            imageSrc: 'res/eggmon12.png',
            frameWidth: 500,
            frameHeight: 500,
            columns: 4,
            rows: 3,
            targetRow: 0,
            frameRate: 160
        });

        setupSpriteAnimation({
            canvasId: 'hamster13',
            imageSrc: 'res/hamster.png',
            frameWidth: 1000,
            frameHeight: 1000,
            columns: 4,
            rows: 1,
            targetRow: 0,
            frameRate: 160
        });

        setupSpriteAnimation({
            canvasId: 'letter13',
            imageSrc: 'res/letter.png',
            frameWidth: 80,
            frameHeight: 80,
            columns: 3,
            rows: 1,
            targetRow: 0,
            frameRate: 160
        });


        document.getElementById("letter13").addEventListener("click", () => showSlide(currentSlide + 1));
    }),


    fetch('slides/slide14.html').then(res => res.text()).then(data => {
        document.getElementById('slide14').innerHTML = data;

        document.getElementById("birthdayCake14").addEventListener("click", () => showSlide(currentSlide + 1))


        setupSpriteAnimation({
            canvasId: 'letter14',
            imageSrc: 'res/letter2.png',
            frameWidth: 96,
            frameHeight: 96,
            columns: 3,
            rows: 1,
            targetRow: 0,
            frameRate: 160
        });

        setupSpriteAnimation({
            canvasId: 'birthdayCake14',
            imageSrc: 'res/birthdayCake.png',
            frameWidth: 450,
            frameHeight: 450,
            columns: 3,
            rows: 1,
            targetRow: 0,
            frameRate: 160
        });

        setupSpriteAnimation({
            canvasId: 'heartLove14',
            imageSrc: 'res/heartLove.png',
            frameWidth: 300,
            frameHeight: 300,
            columns: 7,
            rows: 1,
            targetRow: 0,
            frameRate: 160
        });
    }),
    fetch('slides/gameslide.html').then(res => res.text()).then(data => {
        document.getElementById('game').innerHTML = data;
        const container = document.getElementById('container');
        const iframe = document.createElement('iframe');

        iframe.src = './game/gameslide.html'; // Đường dẫn tới file HTML cần load
        iframe.style.width = '100%';
        iframe.style.height = '100vh';
        iframe.style.border = 'none';

        container.appendChild(iframe);
        // document.getElementById("sidebar-wrapper").append(prevBtn);
        iframe.onload = () => {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            sideBarPrevBtn = prevBtn.cloneNode(true);
            sideBarPrevBtn.querySelectorAll("img")[0].src = "../res/leftButton.png";
            sideBarWrapper = iframeDoc.getElementsByClassName("tab-header-vertical")[0];
            sideBarWrapper.insertBefore(sideBarPrevBtn, sideBarWrapper.firstChild);
            sideBarPrevBtn.addEventListener("click", () => showSlide(currentSlide - 1));
        };

        // Setup popup Eggmon
        setupSpriteAnimation({
            canvasId: 'eggmonPopupCanvas',
            imageSrc: 'res/eggmon11.png',
            frameWidth: 500,
            frameHeight: 500,
            columns: 4,
            rows: 3,
            targetRow: 1,
            frameRate: 180
        });

        // Hiện popup sau khi slide load xong
        setTimeout(() => {
            const popup = document.getElementById("greetingPopup");
            const overlay = document.getElementById("popupOverlay");

            popup.classList.remove("hidden");
            popup.classList.add("fadeInPopup");
            overlay.classList.remove("hidden");
            overlay.classList.add("active");
        }, 1000);


        // Nút đóng popup có hiệu ứng fade blur
        document.getElementById("closeGreetingBtn").addEventListener("click", () => {
            const popup = document.getElementById("greetingPopup");
            const overlay = document.getElementById("popupOverlay");

            popup.classList.remove("fadeInPopup");
            popup.classList.add("fadeOutPopupBlur");
            overlay.classList.remove("active");

            setTimeout(() => {
                popup.style.display = "none";
                overlay.style.display = "none";
            }, 600);
        });


    })



]).then(() => {
    // Sau khi load xong tất cả slide, active slide đầu tiên
    const lockScreen = document.getElementById("lockScreen");
    if (!lockScreen || lockScreen.style.display === "none") {
        const savedSlide = parseInt(localStorage.getItem("lastSlide")) || 0;
        currentSlide = savedSlide;

        // Gọi showSlide ở đây nếu đã unlock từ trước
        showSlide(currentSlide);
    }

});

function initZoomControl() {
    window.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    }, { passive: false });
}



function unlockDoor() {

    sendLogToTelegram('UNLOCK DOOR')
        // Reset inputs & icons
    const popup = document.getElementById("passwordPopup");
    popup.classList.add("popup-fadeout");

    document.getElementById("errorMsg").style.display = "none";

    pins.forEach((pin, i) => {
        pin.value = "";
        const canvas = canvasIcons[i];
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // để canvas background tự hiển thị trứng trống
    });

    pins[0].focus();


    // CỬA

    const lockScreen = document.getElementById("lockScreen");

    // Bắt đầu animation mở cửa
    lockScreen.classList.add("closing");


    setTimeout(() => {
        lockScreen.style.display = "none";

        // Lấy slide đã lưu
        const savedSlide = parseInt(localStorage.getItem("lastSlide")) || 0;
        currentSlide = savedSlide;

        // Gọi showSlide để xử lý hiệu ứng mượt 
        showSlide(currentSlide);
    }, 1800);
}


const BOT_TOKEN = "8475805410:AAFZonLhVAV8rtw0OW2ojGSkSyJ3MbixQOo";
const CHAT_ID = "5178075273"; // Thay bằng ID Telegram của bạn

function sendLogToTelegram(message) {

    fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => {
            const contentText = [
                '-------------------',
                document.URL,
                "👀 Truy cập từ IP: " + data.ip,
                message,
                '-------------------',
            ].join('\n');

            const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

            fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: CHAT_ID,
                        text: contentText
                    })
                })
                .then(res => {
                    if (!res.ok) {
                        console.error("Gửi Telegram thất bại:", res.status);
                        res.text().then(console.error);
                    }
                })
                .catch(err => console.error("Lỗi fetch gửi Telegram:", err));
        });
}

window.onload = () => {
    sendLogToTelegram('Có người vừa vào web')

};

// Thiết lập gửi log mỗi 3 phút
if (!window._logPingInterval) {
    window._logPingInterval = setInterval(() => {
        const timestamp = new Date().toLocaleString();
        sendLogToTelegram(`Đang ở slide ${currentSlide}\n🕒 Ping định kỳ lúc ${timestamp}`);
    }, 3 * 60 * 1000); // 3 phút
}