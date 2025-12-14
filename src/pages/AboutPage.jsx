import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { loadText } from "../lib/storage.js";
import { parseQuestions, QUIZ_QUESTION_LIMIT } from "../lib/quizEngine.js";

export default function AboutPage() {
    const nav = useNavigate();

    // Если ранее уже вставляли вопросы — текст хранится
    const raw = loadText();
    const bank = useMemo(() => parseQuestions(raw), [raw]);
    const total = bank.length;

    const canStartNow = total > 0;

    const onGoImport = () => nav("/import");

    const onStartNow = () => nav("/quizzes/create");


    return (
        <div className="container">
            <header className="header">
                <h1>О приложении</h1>
                <p className="sub">
                    Это учебный квиз. Он формирует случайную выборку из банка вопросов, перемешивает ответы и показывает ошибки после проверки.
                </p>
            </header>

            <section className="card">
                <div className="hd">
                    <h2>Как это работает</h2>
                    <span className="pill">
            {total ? `В банке сейчас: ${total} вопросов` : "Банк вопросов ещё не загружен"}
          </span>
                </div>

                <div className="bd">
                    <div className="grid2">
                        <div className="infoCard">
                            <h3>Шаг 1 — Ввод банка</h3>
                            <p>
                                Вставляешь текст с вопросами и правильными ответами. Формат: A–E и строка
                                <code> Правильный ответ: X</code>.
                            </p>
                        </div>

                        <div className="infoCard">
                            <h3>Шаг 2 — Генерация</h3>
                            <p>
                                Приложение выбирает <b>{QUIZ_QUESTION_LIMIT}</b> случайных вопросов и перемешивает варианты ответов.
                            </p>
                        </div>

                        <div className="infoCard">
                            <h3>Шаг 3 — Ответы</h3>
                            <p>
                                Галочки (checkbox) используются как UI, но логика — <b>один выбор на вопрос</b>.
                            </p>
                        </div>

                        <div className="infoCard">
                            <h3>Шаг 4 — Проверка</h3>
                            <p>
                                После проверки видно: где ошибка, какой правильный вариант, и итоговый счёт.
                            </p>
                        </div>
                    </div>

                    <div className="hr" />

                    <div className="row mt">
                        <button className="btn primary" onClick={onGoImport}>
                            Перейти к вводу вопросов
                        </button>

                        <button className="btn" onClick={onStartNow} disabled={!canStartNow}>
                            Создать квиз (если банк уже загружен)
                        </button>
                    </div>

                    {!canStartNow && (
                        <div className="hint" style={{ marginTop: 10 }}>
                            Чтобы кнопка «Создать квиз» стала активной — сначала перейди к вводу и вставь вопросы.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
