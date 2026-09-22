"use strict";

let questions = [];
let currentQuestion = 0;

let score = 0;
let correctCount = 0;
let wrongCount = 0;
let attemptedCount = 0;

const POSITIVE_MARKS = 2;
const NEGATIVE_MARKS = 2 / 3;

function $(id) {
    return document.getElementById(id);
}

const questionText = $("question-text");
const optionsContainer = $("options-container");

const questionNumber = $("question-number");
const progressText = $("progress-text");
const progressFill = $("progress-fill");

const scoreDisplay = $("score");

const feedbackBox = $("feedback-box");
const feedbackIcon = $("feedback-icon");
const feedbackTitle = $("feedback-title");
const feedbackText = $("feedback-text");

const hintButton = $("hint-button");
const hintBox = $("hint-box");
const hintText = $("hint-text");

const nextButton = $("next-button");

const quizScreen = $("quiz-screen");
const resultScreen = $("result-screen");

const setSelection = $("set-selection");

const setButtons =
    document.querySelectorAll("[data-set]");

const finalScore = $("final-score");
const totalQuestions = $("total-questions");
const attempted = $("attempted");
const correct = $("correct-count");
const wrong = $("wrong-count");
const unattempted = $("unattempted");
const accuracy = $("accuracy");
const positiveMarks = $("positive-marks");
const negativeMarks = $("negative-marks");

const restartButton = $("restart-button");

function addClass(element, className) {
    if (element) {
        element.classList.add(className);
    }
}

function removeClass(element, className) {
    if (element) {
        element.classList.remove(className);
    }
}

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}

function formatScore(value) {
    return Number(value).toFixed(2);
}

/* ================================
   CENTRAL CONFIGURATION
   ================================ */

let config = null;
let selectedSubject = null;
let selectedSet = null;

const configFile =
    "./config.json";

/* ================================
   LOAD QUESTIONS
   ================================ */

async function loadQuestions(subject, set) {
    try {

        const questionFile =
            `./questions/${subject.folder}/${set.file}`;

        const response =
            await fetch(
                questionFile,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                `${subject.name} ${set.name} की JSON file load नहीं हो सकी।`
            );
        }

            const rawText = await response.text();

        let data = [];
        if (rawText.trim()) {
            try {
                const parsed = JSON.parse(rawText);
                if (Array.isArray(parsed)) {
                    data = parsed;
                }
            } catch (e) {
                data = [];
            }
        }

        questions = data;

        startQuiz();

        } catch (error) {
        removeClass(quizScreen, "hidden");
        addClass(setSelection, "hidden");
        const quizCard = document.querySelector(".quiz-question-card") || document.querySelector(".question-card") || quizScreen;
        if (quizCard) {
            quizCard.innerHTML = `
                <div style="text-align:center; padding:40px 20px; background:#fff; border-radius:24px; box-shadow:0 4px 20px rgba(0,0,0,0.06); margin:20px auto; max-width:420px;">
                    <div style="font-size:75px; margin-bottom:12px; line-height:1;">&#128054;</div>
                    <h2 style="font-size:26px; color:#1e293b; margin:0 0 6px; font-weight:800;">Error 404</h2>
                    <p style="font-size:16px; color:#64748b; font-weight:700; margin:0 0 12px;">There is nothing here!</p>
                    <p style="font-size:14px; color:#94a3b8; margin:0 auto 24px; line-height:1.5;">Is set mein abhi questions add nahi kiye gaye hain.</p>
                    <button onclick="location.reload()" type="button" style="background:#1982f6; color:#fff; border:none; padding:12px 26px; border-radius:16px; font-size:15px; font-weight:700; cursor:pointer;">← Go Back to Sets</button>
                </div>
            `;
        }
    }
}

/* ================================
   LOAD ERROR
   ================================ */

function showLoadError(message) {

    if (questionText) {
        questionText.textContent =
            "Questions Load नहीं हुईं";
    }

    if (optionsContainer) {
        optionsContainer.innerHTML = `
            <div style="
                padding:18px;
                border:1px solid #ff4d5a;
                border-radius:14px;
                background:#17090b;
                color:#ffb5ba;
                line-height:1.6;
            ">
                <strong>
                    Quiz Data Error
                </strong>

                <br><br>

                ${escapeHTML(message)}
            </div>
        `;
    }

    if (nextButton) {
        nextButton.disabled = true;
    }
}

/* ================================
   START QUIZ
   ================================ */

function startQuiz() {

    currentQuestion = 0;

    score = 0;
    correctCount = 0;
    wrongCount = 0;
    attemptedCount = 0;

    if (scoreDisplay) {
        scoreDisplay.textContent = "0.00";
    }

            removeClass(quizScreen, "hidden");
        addClass(setSelection, "hidden");
        addClass(resultScreen, "hidden");

        if (!questions || questions.length === 0) {
            const quizCard = document.querySelector(".quiz-question-card") || document.querySelector(".question-card") || quizScreen;
            if (quizCard) {
                quizCard.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; background: #ffffff; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); margin: 20px auto; max-width: 420px;">
                        <div style="font-size: 75px; margin-bottom: 12px; line-height: 1;">&#128054;</div>
                        <h2 style="font-size: 26px; color: #1e293b; margin: 0 0 6px; font-weight: 800;">Error 404</h2>
                        <p style="font-size: 16px; color: #64748b; font-weight: 700; margin: 0 0 12px;">There is nothing here!</p>
                        <p style="font-size: 14px; color: #94a3b8; margin: 0 auto 24px; line-height: 1.5;">Is set mein abhi questions add nahi kiye gaye hain.</p>
                        <button onclick="location.reload()" type="button" style="background: #1982f6; color: #ffffff; border: none; padding: 12px 26px; border-radius: 16px; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(25, 130, 246, 0.3);">← Go Back to Sets</button>
                    </div>
                `;
            }
            return;
        }

        showQuestion();
}

/* ================================
   SHOW QUESTION
   ================================ */

function showQuestion() {

    const question =
        questions[currentQuestion];

    if (!question) {
        showResults();
        return;
    }

    if (questionText) {
        questionText.textContent =
            question.question || "";
    }

    if (questionNumber) {
        questionNumber.textContent =
            `Question ${currentQuestion + 1}`;
    }

    if (progressText) {
        progressText.textContent =
            `${currentQuestion + 1} / ${questions.length}`;
    }

    if (progressFill) {

        const progress =
            ((currentQuestion + 1) /
                questions.length) * 100;

        progressFill.style.width =
            `${progress}%`;
    }

    addClass(
        feedbackBox,
        "hidden"
    );

    addClass(
        hintBox,
        "hidden"
    );

    if (hintButton) {
        hintButton.textContent =
            "💡 Show Hint";
    }

    if (nextButton) {

        nextButton.disabled = true;

        nextButton.textContent =
            currentQuestion ===
            questions.length - 1
                ? "View Report Card →"
                : "Next Question →";
    }

    if (hintText) {

        hintText.textContent =
            question.hint ||
            "प्रश्न को ध्यान से पढ़ें और सभी विकल्पों की तुलना करें।";
    }

    if (!optionsContainer) {
        return;
    }

    optionsContainer.innerHTML = "";

    const optionLetters = [
        "A",
        "B",
        "C",
        "D"
    ];

    if (
        !Array.isArray(question.options) ||
        question.options.length !== 4
    ) {

        optionsContainer.innerHTML = `
            <div style="
                padding:16px;
                border:1px solid #ff4d5a;
                border-radius:12px;
            ">
                इस question में 4 valid options नहीं हैं।
            </div>
        `;

        return;
    }

    question.options.forEach(
        (option, index) => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "option-button";

            button.innerHTML = `
                <span class="option-letter">
                    ${optionLetters[index]}
                </span>

                <span class="option-text">
                    ${escapeHTML(option)}
                </span>
            `;

            button.addEventListener(
                "click",
                () => selectAnswer(index)
            );

            optionsContainer.appendChild(
                button
            );
        }
    );
}

/* ================================
   SELECT ANSWER
   ================================ */

function selectAnswer(selectedIndex) {

    const question =
        questions[currentQuestion];

    if (!question) {
        return;
    }

    const optionButtons =
        optionsContainer
            ? optionsContainer.querySelectorAll(
                ".option-button"
            )
            : [];

    if (
        optionButtons[selectedIndex]?.disabled
    ) {
        return;
    }

    optionButtons.forEach(
        button => {
            button.disabled = true;
        }
    );

    attemptedCount++;

    const correctIndex =
        Number(question.answer);

    const selectedButton =
        optionButtons[selectedIndex];

    const correctButton =
        optionButtons[correctIndex];

    if (
        selectedIndex ===
        correctIndex
    ) {

        correctCount++;

        score +=
            POSITIVE_MARKS;

        if (selectedButton) {

            selectedButton.classList.add(
                "correct"
            );
        }

        showFeedback(
            true,
            "✓",
            "Correct Answer",
            question.explanation ||
            "आपका उत्तर सही है।"
        );

    } else {

        wrongCount++;

        score -=
            NEGATIVE_MARKS;

        if (selectedButton) {

            selectedButton.classList.add(
                "wrong"
            );
        }

        if (correctButton) {

            correctButton.classList.add(
                "correct"
            );
        }

        const correctAnswerText =
            question.options[correctIndex];

        showFeedback(
            false,
            "✕",
            "Wrong Answer",
            `सही उत्तर: ${correctAnswerText}

${question.explanation || ""}`
        );
    }

    if (scoreDisplay) {

        scoreDisplay.textContent =
            formatScore(score);
    }

    if (nextButton) {

        nextButton.disabled = false;
    }
}

/* ================================
   FEEDBACK
   ================================ */

function showFeedback(
    isCorrect,
    icon,
    title,
    message
) {

    if (feedbackIcon) {
        feedbackIcon.textContent =
            icon;
    }

    if (feedbackTitle) {
        feedbackTitle.textContent =
            title;
    }

    if (feedbackText) {
        feedbackText.textContent =
            message;
    }

    if (feedbackBox) {

        removeClass(
            feedbackBox,
            "hidden"
        );

        feedbackBox.classList.toggle(
            "correct-feedback",
            isCorrect
        );

        feedbackBox.classList.toggle(
            "wrong-feedback",
            !isCorrect
        );
    }
}

/* ================================
   HINT
   ================================ */

if (hintButton) {

    hintButton.addEventListener(
        "click",
        () => {

            if (!hintBox) {
                return;
            }

            const isHidden =
                hintBox.classList.contains(
                    "hidden"
                );

            if (isHidden) {

                removeClass(
                    hintBox,
                    "hidden"
                );

                hintButton.textContent =
                    "💡 Hide Hint";

            } else {

                addClass(
                    hintBox,
                    "hidden"
                );

                hintButton.textContent =
                    "💡 Show Hint";
            }
        }
    );
}

/* ================================
   NEXT QUESTION
   ================================ */

if (nextButton) {

    nextButton.addEventListener(
        "click",
        () => {

            if (nextButton.disabled) {
                return;
            }

            currentQuestion++;

            if (
                currentQuestion >=
                questions.length
            ) {

                showResults();

            } else {

                showQuestion();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        }
    );
}

/* ================================
   PREVIOUS QUESTION
   ================================ */

const prevButton = $("quiz-prev-btn");

if (prevButton) {
    prevButton.addEventListener("click", () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion();
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    });
}

/* ================================
   RESULTS
   ================================ */

function showResults() {

    removeClass(
        resultScreen,
        "hidden"
    );

    addClass(
        quizScreen,
        "hidden"
    );

    const total =
        questions.length;

    const unattemptedCount =
        Math.max(
            0,
            total - attemptedCount
        );

    const accuracyValue =
        attemptedCount > 0
            ? (
                correctCount /
                attemptedCount
            ) * 100
            : 0;

    const positive =
        correctCount *
        POSITIVE_MARKS;

    const negative =
        wrongCount *
        NEGATIVE_MARKS;

    if (finalScore) {
        finalScore.textContent =
            formatScore(score);
    }

    if (totalQuestions) {
        totalQuestions.textContent =
            total;
    }

    if (attempted) {
        attempted.textContent =
            attemptedCount;
    }

    if (correct) {
        correct.textContent =
            correctCount;
    }

    if (wrong) {
        wrong.textContent =
            wrongCount;
    }

    if (unattempted) {
        unattempted.textContent =
            unattemptedCount;
    }

    if (accuracy) {
        accuracy.textContent =
            `${accuracyValue.toFixed(1)}%`;
    }

    if (positiveMarks) {
        positiveMarks.textContent =
            `+${positive.toFixed(2)}`;
    }

    if (negativeMarks) {
        negativeMarks.textContent =
            `−${negative.toFixed(2)}`;
    }
}

/* ================================
   RESTART
   ================================ */

if (restartButton) {

    restartButton.addEventListener(
        "click",
        () => {

            startQuiz();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    );
}

/* ================================
   START
   ================================ */

/* ================================
   CENTRAL CONFIGURATION LOADER
   ================================ */

const setList =
    document.querySelector(".set-list");

const selectionTitle =
    setSelection
        ? setSelection.querySelector("h2")
        : null;

const selectionLabel =
    setSelection
        ? setSelection.querySelector(".question-label")
        : null;

const selectionDescription =
    setSelection
        ? setSelection.querySelector("p")
        : null;


/* ================================
   LOAD CONFIGURATION
   ================================ */

async function loadConfig() {

    try {

        const response =
            await fetch(
                configFile,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                "config.json load नहीं हो सकी।"
            );
        }

        const data =
            await response.json();

        if (
            !data ||
            !Array.isArray(data.subjects)
        ) {
            throw new Error(
                "config.json का format गलत है।"
            );
        }

        config = data;

        showSubjects();

    } catch (error) {

        console.error(
            "Configuration Error:",
            error
        );

        if (setList) {

            setList.innerHTML = `
                <div style="
                    padding:18px;
                    border:1px solid #ff4d5a;
                    border-radius:14px;
                    background:#17090b;
                    color:#ffb5ba;
                    line-height:1.6;
                ">
                    <strong>
                        Configuration Error
                    </strong>

                    <br><br>

                    ${escapeHTML(error.message)}
                </div>
            `;
        }
    }
}


/* ================================
   SHOW SUBJECTS
   ================================ */

function showSubjects() {

    if (!setList || !config) {
        return;
    }

    if (selectionLabel) {
        selectionLabel.textContent =
            "CET-12th QUIZ";
    }

    if (selectionTitle) {
        selectionTitle.textContent =
            "Choose Subject";
    }

    if (selectionDescription) {
        selectionDescription.textContent =
            "Select a subject to continue.";
    }

    setList.innerHTML = "";

    config.subjects.forEach(
        subject => {

            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                "option-button";

            button.innerHTML = `
    <span class="option-letter">
        ${escapeHTML(
            subject.name
                .charAt(0)
                .toUpperCase()
        )}
    </span>

    <span class="option-text">
        ${escapeHTML(
            subject.name
        )}
    </span>
`;

            button.addEventListener(
                "click",
                () => {
                    showSets(subject);
                }
            );

            setList.appendChild(
                button
            );
        }
    );
}


/* ================================
   SHOW SETS
   ================================ */

function showSets(subject) {

    selectedSubject =
        subject;

    if (!setList) {
        return;
    }

    if (selectionLabel) {
        selectionLabel.textContent =
            `${subject.name} QUIZ`;
    }

    if (selectionTitle) {
        selectionTitle.textContent =
            "Choose Your Set";
    }

    if (selectionDescription) {
        selectionDescription.textContent =
            `Select a question set from ${subject.name}.`;
    }

    setList.innerHTML = "";

    /* BACK BUTTON */

    const backButton =
        document.createElement(
            "button"
        );

    backButton.type = "button";

    backButton.className =
        "option-button";

    backButton.innerHTML = `
        <span class="option-letter">
            ←
        </span>

        <span class="option-text">
            Back to Subjects
        </span>
    `;

    backButton.addEventListener(
        "click",
        () => {
            showSubjects();
        }
    );

    setList.appendChild(
        backButton
    );


    /* SET BUTTONS */

    subject.sets.forEach(
        set => {

            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                "option-button";

            button.innerHTML = `
                <span class="option-letter">
                    ${escapeHTML(
                        String(set.id)
                    )}
                </span>

                <span class="option-text">
                    ${escapeHTML(
                        set.name
                    )}
                </span>
            `;

            button.addEventListener(
                "click",
                () => {

                    selectedSet =
                        set;

                    if (setSelection) {
                        setSelection.classList.add(
                            "hidden"
                        );
                    }

                    loadQuestions(
                        subject,
                        set
                    );
                }
            );

            setList.appendChild(
                button
            );
        }
    );
}


/* ================================
   INITIAL SCREEN
   ================================ */

if (setSelection) {
    setSelection.classList.remove(
        "hidden"
    );
}

if (quizScreen) {
    quizScreen.classList.add(
        "hidden"
    );
}

if (resultScreen) {
    resultScreen.classList.add(
        "hidden"
    );
}


/* ================================
   START CONFIGURATION
   ================================ */

loadConfig();
