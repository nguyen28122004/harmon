function initQuiz() {
    const buttons = Array.from(document.querySelectorAll('.ans'));
    const questionDiv = document.getElementById('questionText');
    const popup = document.getElementById('popup');
    const popupText = document.getElementById('popup-text');
    const popupClose = document.getElementById('popup-close');
    const nextBtn = document.getElementById('nextBtn');

    const quiz = [{
            question: "Con nghĩ là sau này con muốn làm thám tử. <br>Mà thám tử thì cần phải có thật nhìu kiến thức. <br>Con đố mama mí câu nháaaa",
            answers: ["Oke bé con", "Triển thoiii"],
            correct: [0, 1],
            popupCorrect: "Cảm ơn mamaaa\nTụi mình bắt đầu nháaaa"
        },
        {
            question: "1 + 1 bằng mấy",
            answers: ["1", "2", "3", "4"],
            correct: [2]
        },
        {
            question: "Zịt kêu như nàoooo",
            answers: ["Quạc quạc", "Chiêm chiếp", "Oe oeee", "Măm mămm"],
            correct: [0, 2],
            popupCorrect: "Đúng rồi, mama chính là nhà zịt học!",
            popupWrong: "Sai rùi mama, để bé gợi ý nha, con Zịt kêu oe oeee!"
        },
        {
            question: "Chym papa dài bao nhiuuu",
            answers: ["5cm", "15cm", "20cm", "100cm"],
            correct: [3],
            popupCorrect: "papa bảo papa có mụt cái chym siu cấp",
            popupWrong: "Sai rùi mama, chym papa khum ngắn thế đâuuuu!"
        }
    ];

    let currentQuizIndex = 0;

    // Ẩn nextBtn ban đầu
    if (nextBtn && parseInt(localStorage.getItem("lastSlide")) == 9) nextBtn.style.display = 'none';

    // Gán sự kiện click cho các nút một lần duy nhất
    buttons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const currentQuiz = quiz[currentQuizIndex];
            const correctIndexes = currentQuiz.correct || [];

            // Nếu đã chọn trước đó thì không xử lý gì thêm (ngăn chọn nhiều lần)
            if (btn.classList.contains('answered')) return;

            // Đánh dấu đã chọn
            btn.classList.add('answered');

            const isCorrect = correctIndexes.includes(index);

            if (isCorrect) {
                btn.style.backgroundColor = '#d0f5d3'; // xanh lá pastel
                const msg = currentQuiz.popupCorrect || "🎉 Đúng rồi! Mama giỏi quá 🥳";
                showPopup(msg, true);
            } else {
                btn.style.backgroundColor = '#ffd6d6'; // đỏ pastel
                const msg = currentQuiz.popupWrong || "❌ Sai rồi 😝 Mama thử lại nha!";
                showPopup(msg, false);
                return; // Không chuyển câu hỏi
            }

            currentQuizIndex++;
            if (currentQuizIndex < quiz.length) {
                setTimeout(() => {
                    loadQuestion();
                }, 1500);
            } else {
                setTimeout(() => {
                    questionDiv.innerHTML = "Hết rùi, cảm ơn mama đã chơi dới connn!";
                    document.querySelector('.ans-wrapper').style.display = 'none';
                    if (nextBtn) nextBtn.style.display = 'inline-block';
                }, 2000);
            }
        });
    });

    popupClose.addEventListener('click', () => {
        popup.classList.add('hidden');
    });

    function loadQuestion() {
        const q = quiz[currentQuizIndex];
        questionDiv.innerHTML = q.question;

        buttons.forEach((btn, i) => {
            btn.classList.remove('answered');
            btn.style.backgroundColor = ''; // reset màu

            if (q.answers[i] !== undefined) {
                btn.style.display = 'inline-block';
                btn.innerText = q.answers[i];
            } else {
                btn.style.display = 'none';
            }
        });
    }

    function showPopup(message, isCorrect) {
        popupText.innerText = message;
        popup.classList.remove('hidden');
        const popupContent = popup.querySelector('.popup-content');
        popupContent.style.backgroundColor = isCorrect ? '#e0f7fa' : '#ffebee';
    }

    // 👇 Load câu hỏi đầu tiên khi gọi hàm
    loadQuestion();
}