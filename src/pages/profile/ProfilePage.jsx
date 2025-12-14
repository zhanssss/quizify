import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setDisplayName,
    setDefaultQuestionCount,
    setShuffleAnswers,
    setShuffleQuestions,
} from "../../app/features/profile/profileSlice.js";

export default function ProfilePage() {
    const dispatch = useDispatch();
    const displayName = useSelector((s) => s.profile.user.displayName);
    const settings = useSelector((s) => s.profile.settings);

    const [nameDraft, setNameDraft] = useState(displayName);

    const maxQuestionsHint = useMemo(() => {
        // В будущем можно подтягивать из активного банка (parsedCount), но пока просто подсказка
        return "Рекомендуется ставить значение не больше размера банка.";
    }, []);

    const onApplyName = () => dispatch(setDisplayName(nameDraft));

    return (
        <div className="container">
            <header className="header">
                <h1>Профиль</h1>
                <p className="sub">
                    Настройки сохраняются при переходах по страницам. При перезагрузке вкладки сбрасываются (пока нет бэка).
                </p>
            </header>

            <section className="card">
                <div className="hd">
                    <h2>Пользователь</h2>
                    <span className="pill">Redux-only</span>
                </div>

                <div className="bd">
                    <div className="row mt" style={{ alignItems: "center", gap: 10 }}>
                        <label style={{ minWidth: 130, opacity: 0.9 }}>Отображаемое имя</label>
                        <input
                            className="input"
                            value={nameDraft}
                            onChange={(e) => setNameDraft(e.target.value)}
                            placeholder="Введите имя"
                            style={{ flex: 1, minWidth: 220 }}
                        />
                        <button className="btn primary" onClick={onApplyName}>
                            Сохранить
                        </button>
                    </div>

                    <div className="hint" style={{ marginTop: 10 }}>
                        Текущее имя: <b>{displayName}</b>
                    </div>
                </div>
            </section>

            <section className="card">
                <div className="hd">
                    <h2>Настройки квиза</h2>
                    <span className="pill">По умолчанию</span>
                </div>

                <div className="bd">
                    <div className="row mt" style={{ alignItems: "center", gap: 10 }}>
                        <label style={{ minWidth: 130, opacity: 0.9 }}>Кол-во вопросов</label>
                        <input
                            className="input input--sm"
                            type="number"
                            min={1}
                            max={300}
                            value={settings.defaultQuestionCount}
                            onChange={(e) => dispatch(setDefaultQuestionCount(e.target.value))}
                            style={{ width: 120 }}
                        />

                        <span className="hint">{maxQuestionsHint}</span>
                    </div>

                    <div className="row mt" style={{ gap: 12, alignItems: "center" }}>
                        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <input
                                type="checkbox"
                                checked={settings.shuffleQuestions}
                                onChange={(e) => dispatch(setShuffleQuestions(e.target.checked))}
                            />
                            Перемешивать вопросы
                        </label>

                        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <input
                                type="checkbox"
                                checked={settings.shuffleAnswers}
                                onChange={(e) => dispatch(setShuffleAnswers(e.target.checked))}
                            />
                            Перемешивать ответы
                        </label>
                    </div>

                    <div className="hint" style={{ marginTop: 10 }}>
                        Эти настройки используются при создании квиза на странице “Создание квиза”.
                    </div>
                </div>
            </section>
        </div>
    );
}
