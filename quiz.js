function initQuiz() {
    const buttons = Array.from(document.querySelectorAll('.ans'));
    const questionDiv = document.getElementById('questionText');
    const popup = document.getElementById('popup');
    const popupText = document.getElementById('popup-text');
    const popupClose = document.getElementById('popup-close');
    const nextBtn = document.getElementById('nextBtn'); // Thêm dòng này

    const quiz = [{
            question: "Con nghĩ là sau này con muốn làm thám tử. <br>Mà thám tử thì cần phải có thật nhìu kiến thức. <br>Con đố mama mí câu nháaaa",
            answers: ["Oke bé con", "Triển thoiii"],
            correct: [0, 1],
            popupCorrect: "Cảm ơn mamaaa"
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
            const isCorrect = correctIndexes.includes(index);

            if (isCorrect) {
                const msg = currentQuiz.popupCorrect || "🎉 Đúng rồi! Mama giỏi quá 🥳";
                showPopup(msg, true);
            } else {
                const msg = currentQuiz.popupWrong || "❌ Sai rồi 😝 Mama thử lại nha!";
                showPopup(msg, false);
                return; // Không chuyển câu hỏi
            }

            // Chuyển sang câu tiếp theo
            currentQuizIndex++;
            if (currentQuizIndex < quiz.length) {
                setTimeout(() => {
                    loadQuestion();
                }, 1500);
            } else {
                setTimeout(() => {
                    questionDiv.innerHTML = "Hết rùi, cảm ơn mama đã chơi dới connn!";
                    document.querySelector('.ans-wrapper').style.display = 'none';
                    if (nextBtn) nextBtn.style.display = 'inline-block'; // 👉 Hiện nút next
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