let bible = null;
let allVerses = [];

let selectedBook = null;
let selectedChapter = null;

let searchResults = [];
let currentSearchPage = 1;
const SEARCH_RESULTS_PER_PAGE = 20;

// ============================================
// LOAD BIBLE
// ============================================

async function loadBible() {

    try {

        const response =
            await fetch("data/bible.json");

        if (!response.ok) {
            throw new Error("Could not load Bible.");
        }

        bible =
            await response.json();

        allVerses = [];

        for (const book of bible.books) {

            for (const chapter of book.chapters) {

                for (const verse of chapter.verses) {

                    allVerses.push({

                        book: book.englishName,

                        chapter:
                            chapter.chapter ??
                            chapter.number,

                        verse:
                            verse.number ??
                            verse.verse,

                        text: verse.text

                    });

                }

            }

        }

        console.log(
            `Loaded ${allVerses.length} Bible verses.`
        );

        showDailyVerse();

        buildBookList();

        loadHighlights();

    } catch (error) {

        console.error(
            "Bible loading error:",
            error
        );

    }

}


// ============================================
// RANDOM VERSE
// ============================================

function getRandomVerse() {

    const randomIndex =
        Math.floor(
            Math.random() *
            allVerses.length
        );

    return allVerses[randomIndex];

}


function displayVerse(
    verse,
    referenceElement,
    textElement
) {

    referenceElement.textContent =
        `${verse.book} ${verse.chapter}:${verse.verse}`;

    textElement.textContent =
        verse.text;

}


function showRandomVerse() {

    if (!allVerses.length) {
        return;
    }

    const verse = getRandomVerse();

    displayVerse(
        verse,
        document.getElementById(
            "daily-reference"
        ),
        document.getElementById(
            "daily-text"
        )
    );

    // Remember the verse the user chose
    localStorage.setItem(
        "dailyVerse",
        JSON.stringify(verse)
    );
}

// ============================================
// SAVE Daily VERSE
// ============================================

function saveDailyVerse() {

    const reference =
        document.getElementById(
            "daily-reference"
        ).textContent;

    if (
        !reference ||
        reference === "Loading..."
    ) {
        return;
    }

    const verse =
        allVerses.find(
            v =>
                `${v.book} ${v.chapter}:${v.verse}` ===
                reference
        );

    if (!verse) {
        return;
    }

    const highlights =
        getHighlights();

    const key =
        makeHighlightKey(
            verse.book,
            verse.chapter,
            verse.verse
        );

    highlights[key] =
        verse;

    saveHighlights(
        highlights
    );

    loadHighlights();

}

// ============================================
// DAILY VERSE
// ============================================

function showDailyVerse() {

    if (!allVerses.length) {
        return;
    }

    const savedVerse =
        localStorage.getItem(
            "dailyVerse"
        );

    // If the user already chose a verse,
    // keep showing that verse.
    if (savedVerse) {

        const verse =
            JSON.parse(savedVerse);

        displayVerse(
            verse,
            document.getElementById(
                "daily-reference"
            ),
            document.getElementById(
                "daily-text"
            )
        );

        return;
    }

    // Otherwise choose the initial verse
    const today =
        new Date();

    const dateNumber =
        today.getFullYear() * 10000 +
        (today.getMonth() + 1) * 100 +
        today.getDate();

    const index =
        dateNumber % allVerses.length;

    const verse =
        allVerses[index];

    displayVerse(
        verse,
        document.getElementById(
            "daily-reference"
        ),
        document.getElementById(
            "daily-text"
        )
    );

}


// ============================================
// BIBLE BOOKS
// ============================================

const OLD_TESTAMENT = [

    "Genesis",
    "Exodus",
    "Leviticus",
    "Numbers",
    "Deuteronomy",
    "Joshua",
    "Judges",
    "Ruth",
    "1 Samuel",
    "2 Samuel",
    "1 Kings",
    "2 Kings",
    "1 Chronicles",
    "2 Chronicles",
    "Ezra",
    "Nehemiah",
    "Esther",
    "Job",
    "Psalms",
    "Proverbs",
    "Ecclesiastes",
    "Song of Solomon",
    "Isaiah",
    "Jeremiah",
    "Lamentations",
    "Ezekiel",
    "Daniel",
    "Hosea",
    "Joel",
    "Amos",
    "Obadiah",
    "Jonah",
    "Micah",
    "Nahum",
    "Habakkuk",
    "Zephaniah",
    "Haggai",
    "Zechariah",
    "Malachi"

];


const NEW_TESTAMENT = [

    "Matthew",
    "Mark",
    "Luke",
    "John",
    "Acts",
    "Romans",
    "1 Corinthians",
    "2 Corinthians",
    "Galatians",
    "Ephesians",
    "Philippians",
    "Colossians",
    "1 Thessalonians",
    "2 Thessalonians",
    "1 Timothy",
    "2 Timothy",
    "Titus",
    "Philemon",
    "Hebrews",
    "James",
    "1 Peter",
    "2 Peter",
    "1 John",
    "2 John",
    "3 John",
    "Jude",
    "Revelation"

];


function getBookByName(name) {

    return bible.books.find(
        book =>
            book.englishName === name
    );

}


function buildBookList() {

    buildBookSection(
        OLD_TESTAMENT,
        document.getElementById(
            "old-testament"
        )
    );

    buildBookSection(
        NEW_TESTAMENT,
        document.getElementById(
            "new-testament"
        )
    );

}


function buildBookSection(
    bookNames,
    container
) {

    container.innerHTML = "";

    for (const name of bookNames) {

        const book =
            getBookByName(name);

        if (!book) {
            continue;
        }

        const button =
            document.createElement(
                "button"
            );

        button.className =
            "book-button";

        button.textContent =
            name;

        button.addEventListener(
            "pointerup",
            () => selectBook(book)
        );

        container.appendChild(
            button
        );

    }

}


// ============================================
// CHAPTERS
// ============================================

function selectBook(book) {

    selectedBook = book;

    document
        .getElementById(
            "book-selection"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "chapter-selection"
        )
        .classList.remove("hidden");

    document
        .getElementById(
            "back-to-books"
        )
        .classList.remove("hidden");

    document
        .getElementById(
            "selected-book-name"
        )
        .textContent =
        book.englishName;

    document
        .getElementById(
            "bible-title"
        )
        .textContent =
        book.englishName;

    buildChapterList(book);

}


function buildChapterList(book) {

    const container =
        document.getElementById(
            "chapter-grid"
        );

    container.innerHTML = "";

    book.chapters.forEach(
        (chapter, index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "chapter-button";

            const chapterNumber =
                chapter.chapter ??
                chapter.number ??
                index + 1;

            button.textContent =
                chapterNumber;

            button.addEventListener(
                "pointerup",
                () =>
                    openChapter(
                        chapter,
                        chapterNumber
                    )
            );

            container.appendChild(
                button
            );

        }
    );

}


// ============================================
// READ CHAPTER
// ============================================

function openChapter(
    chapter,
    chapterNumber
) {

    selectedChapter =
        chapterNumber;

    document
        .getElementById(
            "chapter-selection"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "reading-screen"
        )
        .classList.remove("hidden");

    document
        .getElementById(
            "reading-title"
        )
        .textContent =
        `${selectedBook.englishName} ${chapterNumber}`;

    const container =
        document.getElementById(
            "verse-list"
        );

    container.innerHTML = "";

    for (const verse of chapter.verses) {

        const verseNumber =
            verse.number ??
            verse.verse;

        const verseElement =
            document.createElement(
                "div"
            );

        verseElement.className =
            "verse";

        const highlightKey =
            makeHighlightKey(
                selectedBook.englishName,
                chapterNumber,
                verseNumber
            );

        if (
            isHighlighted(
                highlightKey
            )
        ) {

            verseElement.classList.add(
                "highlighted"
            );

        }

        const numberElement =
            document.createElement(
                "span"
            );

        numberElement.className =
            "verse-number";

        numberElement.textContent =
            verseNumber;

        verseElement.appendChild(
            numberElement
        );

        const textElement =
            document.createElement(
                "span"
            );

        textElement.textContent =
            verse.text;

        verseElement.appendChild(
            textElement
        );

        verseElement.addEventListener(
            "pointerup",
            () => {

                const verseData = {
                    book:
                        selectedBook.englishName,
                    chapter:
                        chapterNumber,
                    verse:
                        verseNumber,
                    text:
                        verse.text
                };

                const key =
                    makeHighlightKey(
                        verseData.book,
                        verseData.chapter,
                        verseData.verse
                    );

                const wasHighlighted =
                    isHighlighted(key);

                toggleHighlight(
                    verseElement,
                    verseData
                );

                // If it was already highlighted,
                // it was just unhighlighted.
                // Remove the note button.
                if (wasHighlighted) {

                    const existingButton =
                        verseElement.querySelector(
                            ".verse-note-button"
                        );

                    if (existingButton) {
                        existingButton.remove();
                    }

                    return;
                }

                // It was just highlighted,
                // so create the note button.
                const noteButton =
                    document.createElement(
                        "button"
                    );

                noteButton.className =
                    "verse-note-button";

                const highlights =
                    getHighlights();

                noteButton.textContent =
                    highlights[key]?.note
                        ? "📝 Edit Note"
                        : "📝 Add Note";

                noteButton.addEventListener(
                    "pointerup",
                    event => {

                        event.stopPropagation();

                        const currentHighlights =
                            getHighlights();

                        const currentNote =
                            currentHighlights[key]?.note ||
                            "";

                        const newNote =
                            prompt(
                                "Add a note for this verse:",
                                currentNote
                            );

                        if (
                            newNote === null
                        ) {
                            return;
                        }

                        const updatedHighlights =
                            getHighlights();

                        updatedHighlights[key] = {
                            ...updatedHighlights[key],
                            note:
                                newNote.trim()
                        };

                        saveHighlights(
                            updatedHighlights
                        );

                        noteButton.textContent =
                            newNote.trim()
                                ? "📝 Edit Note"
                                : "📝 Add Note";
                    }
                );

                verseElement.appendChild(
                    noteButton
                );
            }
        );

        container.appendChild(
            verseElement
        );

    }

}


// ============================================
// HIGHLIGHTS
// ============================================

function makeHighlightKey(
    book,
    chapter,
    verse
) {

    return `${book}-${chapter}-${verse}`;

}


function getHighlights() {

    return JSON.parse(
        localStorage.getItem(
            "bibleHighlights"
        ) || "{}"
    );

}


function saveHighlights(
    highlights
) {

    localStorage.setItem(
        "bibleHighlights",
        JSON.stringify(
            highlights
        )
    );

}


function isHighlighted(key) {

    const highlights =
        getHighlights();

    return Boolean(
        highlights[key]
    );

}


function toggleHighlight(
    element,
    verse
) {
    const key =
        makeHighlightKey(
            verse.book,
            verse.chapter,
            verse.verse
        );

    const highlights =
        getHighlights();

    if (highlights[key]) {
        delete highlights[key];

        element.classList.remove(
            "highlighted"
        );
    } else {
        highlights[key] = {
            ...verse,
            note: ""
        };

        element.classList.add(
            "highlighted"
        );
    }

    saveHighlights(
        highlights
    );

    loadHighlights();
}


// ============================================
// HIGHLIGHTS SCREEN
// ============================================

function loadHighlights() {

    const container =
        document.getElementById(
            "highlight-list"
        );

    if (!container) {
        return;
    }

    const highlights =
        getHighlights();

    container.innerHTML = "";

    const entries =
        Object.values(
            highlights
        );

    if (entries.length === 0) {

        container.innerHTML = `
            <div class="empty-highlights">
                Tap any verse while reading
                to highlight it.
            </div>
        `;

        return;
    }

    entries.forEach(
        verse => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "highlight-item";

            item.innerHTML = `
                <div class="highlight-reference">
                    ${verse.book}
                    ${verse.chapter}:${verse.verse}
                </div>

                <div class="highlight-text">
                    ${verse.text}
                </div>

                <div class="highlight-note">
                    ${
                        verse.note
                            ? `📝 ${verse.note}`
                            : ""
                    }
                </div>

                <button class="note-button">
                    ${
                        verse.note
                            ? "Edit Note"
                            : "📝 Add Note"
                    }
                </button>

                <button class="unsave-button">
                    Remove Highlight
                </button>
            `;

            const noteButton =
                item.querySelector(
                    ".note-button"
                );

            noteButton.addEventListener(
                "pointerup",
                () => {

                    const currentNote =
                        verse.note || "";

                    const newNote =
                        prompt(
                            "Add a note for this verse:",
                            currentNote
                        );

                    if (
                        newNote === null
                    ) {
                        return;
                    }

                    const updatedHighlights =
                        getHighlights();

                    const key =
                        makeHighlightKey(
                            verse.book,
                            verse.chapter,
                            verse.verse
                        );

                    updatedHighlights[key] = {
                        ...verse,
                        note:
                            newNote.trim()
                    };

                    saveHighlights(
                        updatedHighlights
                    );

                    loadHighlights();
                }
            );

            const removeButton =
                item.querySelector(
                    ".unsave-button"
                );

            removeButton.addEventListener(
                "pointerup",
                () => {

                    const updatedHighlights =
                        getHighlights();

                    const key =
                        makeHighlightKey(
                            verse.book,
                            verse.chapter,
                            verse.verse
                        );

                    delete updatedHighlights[
                        key
                    ];

                    saveHighlights(
                        updatedHighlights
                    );

                    loadHighlights();
                }
            );

            container.appendChild(
                item
            );
        }
    );
}


// ============================================
// NAVIGATION
// ============================================

function showScreen(
    screenId
) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.add(
                "hidden"
            );

        });

    document
        .getElementById(screenId)
        .classList.remove(
            "hidden"
        );

}


document
    .querySelectorAll(".nav-button")
    .forEach(button => {

        button.addEventListener(
            "pointerup",
            () => {

                const screen =
                    button.dataset.screen;

                showScreen(screen);

                document
                    .querySelectorAll(
                        ".nav-button"
                    )
                    .forEach(
                        nav =>
                            nav.classList.remove(
                                "active"
                            )
                    );

                button.classList.add(
                    "active"
                );

                if (
                    screen ===
                    "highlights-screen"
                ) {

                    loadHighlights();

                }

            }
        );

    });


// Back to books

document
    .getElementById(
        "back-to-books"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "chapter-selection"
                )
                .classList.add(
                    "hidden"
                );

            document
                .getElementById(
                    "book-selection"
                )
                .classList.remove(
                    "hidden"
                );

            document
                .getElementById(
                    "back-to-books"
                )
                .classList.add(
                    "hidden"
                );

            document
                .getElementById(
                    "bible-title"
                )
                .textContent =
                "Bible";

        }
    );


// Back to chapters

document
    .getElementById(
        "back-to-chapters"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "reading-screen"
                )
                .classList.add(
                    "hidden"
                );

            document
                .getElementById(
                    "chapter-selection"
                )
                .classList.remove(
                    "hidden"
                );

        }
    );


// Random verse

document
    .getElementById(
        "new-verse"
    )
    .addEventListener(
        "click",
        showRandomVerse
    );

// Save Daily Verse

document
    .getElementById(
        "save-daily-verse"
    )
    .addEventListener(
        "pointerup",
        saveDailyVerse
    );


// Start app

loadBible();

// ============================================
// FEELING VERSES
// ============================================

const feelingVerses = {

    happy: [
        ["Psalm", 16, 11],
        ["Psalm", 30, 5],
        ["Psalm", 32, 11],
        ["Psalm", 47, 1],
        ["Psalm", 66, 1],
        ["Psalm", 67, 4],
        ["Psalm", 68, 3],
        ["Psalm", 92, 4],
        ["Psalm", 96, 1],
        ["Psalm", 98, 4],
        ["Psalm", 100, 1],
        ["Psalm", 118, 24],
        ["Psalm", 126, 5],
        ["Proverbs", 15, 13],
        ["Proverbs", 17, 22],
        ["Ecclesiastes", 3, 12],
        ["Isaiah", 12, 3],
        ["Isaiah", 35, 10],
        ["Isaiah", 55, 12],
        ["Isaiah", 61, 10],
        ["John", 15, 11],
        ["John", 16, 24],
        ["Romans", 12, 12],
        ["Romans", 15, 13],
        ["Galatians", 5, 22],
        ["Philippians", 4, 4],
        ["Philippians", 4, 13],
        ["1 Thessalonians", 5, 16],
        ["James", 1, 2],
        ["1 Peter", 1, 8],
        ["1 Peter", 4, 13],
        ["1 John", 1, 4],
        ["Jude", 1, 24],
        ["Revelation", 19, 7],
        ["Revelation", 21, 4]
    ],

    sad: [
        ["Psalm", 6, 6],
        ["Psalm", 13, 1],
        ["Psalm", 18, 6],
        ["Psalm", 23, 4],
        ["Psalm", 27, 13],
        ["Psalm", 30, 5],
        ["Psalm", 31, 9],
        ["Psalm", 34, 18],
        ["Psalm", 40, 1],
        ["Psalm", 42, 5],
        ["Psalm", 42, 11],
        ["Psalm", 43, 5],
        ["Psalm", 55, 22],
        ["Psalm", 56, 8],
        ["Psalm", 61, 2],
        ["Psalm", 73, 26],
        ["Psalm", 77, 11],
        ["Psalm", 86, 7],
        ["Psalm", 91, 4],
        ["Psalm", 119, 50],
        ["Psalm", 119, 76],
        ["Psalm", 130, 5],
        ["Isaiah", 41, 10],
        ["Isaiah", 43, 2],
        ["Isaiah", 49, 15],
        ["Lamentations", 3, 21],
        ["Lamentations", 3, 22],
        ["Lamentations", 3, 23],
        ["Matthew", 5, 4],
        ["Matthew", 11, 28],
        ["John", 14, 18],
        ["John", 16, 20],
        ["2 Corinthians", 1, 3],
        ["2 Corinthians", 1, 4],
        ["Revelation", 21, 4]
    ],

    anxious: [
        ["Psalm", 23, 4],
        ["Psalm", 34, 4],
        ["Psalm", 37, 5],
        ["Psalm", 46, 1],
        ["Psalm", 46, 10],
        ["Psalm", 55, 22],
        ["Psalm", 56, 3],
        ["Psalm", 61, 2],
        ["Psalm", 62, 8],
        ["Psalm", 91, 1],
        ["Psalm", 94, 19],
        ["Psalm", 112, 7],
        ["Psalm", 121, 1],
        ["Proverbs", 3, 5],
        ["Proverbs", 12, 25],
        ["Isaiah", 26, 3],
        ["Isaiah", 41, 10],
        ["Isaiah", 41, 13],
        ["Isaiah", 43, 1],
        ["Isaiah", 43, 2],
        ["Matthew", 6, 25],
        ["Matthew", 6, 27],
        ["Matthew", 6, 31],
        ["Matthew", 6, 33],
        ["Matthew", 6, 34],
        ["John", 14, 1],
        ["John", 14, 27],
        ["Philippians", 4, 6],
        ["Philippians", 4, 7],
        ["Philippians", 4, 8],
        ["2 Timothy", 1, 7],
        ["Hebrews", 13, 5],
        ["1 Peter", 5, 6],
        ["1 Peter", 5, 7],
        ["2 Thessalonians", 3, 16]
    ],

    angry: [
        ["Proverbs", 12, 16],
        ["Proverbs", 14, 29],
        ["Proverbs", 15, 1],
        ["Proverbs", 15, 18],
        ["Proverbs", 16, 32],
        ["Proverbs", 17, 9],
        ["Proverbs", 19, 11],
        ["Proverbs", 20, 3],
        ["Proverbs", 22, 24],
        ["Proverbs", 25, 15],
        ["Proverbs", 29, 11],
        ["Proverbs", 29, 22],
        ["Ecclesiastes", 7, 9],
        ["Matthew", 5, 9],
        ["Matthew", 5, 22],
        ["Matthew", 5, 23],
        ["Matthew", 5, 24],
        ["Matthew", 5, 44],
        ["Matthew", 6, 14],
        ["Mark", 11, 25],
        ["Luke", 6, 27],
        ["Luke", 6, 28],
        ["Romans", 12, 17],
        ["Romans", 12, 18],
        ["Romans", 12, 19],
        ["Romans", 12, 20],
        ["Romans", 12, 21],
        ["Ephesians", 4, 26],
        ["Ephesians", 4, 31],
        ["Ephesians", 4, 32],
        ["Colossians", 3, 8],
        ["Colossians", 3, 12],
        ["Colossians", 3, 13],
        ["James", 1, 19],
        ["James", 1, 20]
    ],

    lonely: [
        ["Genesis", 28, 15],
        ["Deuteronomy", 31, 6],
        ["Deuteronomy", 31, 8],
        ["Joshua", 1, 5],
        ["Joshua", 1, 9],
        ["1 Samuel", 12, 22],
        ["1 Kings", 19, 4],
        ["Psalm", 23, 4],
        ["Psalm", 25, 16],
        ["Psalm", 27, 10],
        ["Psalm", 34, 18],
        ["Psalm", 46, 1],
        ["Psalm", 68, 5],
        ["Psalm", 68, 6],
        ["Psalm", 73, 23],
        ["Psalm", 73, 26],
        ["Psalm", 91, 15],
        ["Psalm", 139, 7],
        ["Psalm", 139, 8],
        ["Isaiah", 41, 10],
        ["Isaiah", 43, 2],
        ["Isaiah", 43, 5],
        ["Isaiah", 49, 15],
        ["Jeremiah", 31, 3],
        ["Matthew", 28, 20],
        ["John", 14, 16],
        ["John", 14, 18],
        ["John", 14, 23],
        ["John", 15, 9],
        ["John", 16, 32],
        ["Romans", 8, 38],
        ["Romans", 8, 39],
        ["Hebrews", 13, 5],
        ["1 Peter", 5, 7],
        ["1 John", 4, 13]
    ],

    grateful: [
        ["Psalm", 9, 1],
        ["Psalm", 30, 12],
        ["Psalm", 34, 1],
        ["Psalm", 92, 1],
        ["Psalm", 95, 2],
        ["Psalm", 100, 4],
        ["Psalm", 103, 1],
        ["Psalm", 103, 2],
        ["Psalm", 105, 1],
        ["Psalm", 106, 1],
        ["Psalm", 107, 1],
        ["Psalm", 107, 8],
        ["Psalm", 107, 21],
        ["Psalm", 107, 22],
        ["Psalm", 116, 12],
        ["Psalm", 118, 1],
        ["Psalm", 118, 29],
        ["Psalm", 136, 1],
        ["Psalm", 136, 26],
        ["Daniel", 2, 23],
        ["Luke", 17, 15],
        ["Luke", 17, 16],
        ["Romans", 1, 21],
        ["1 Corinthians", 15, 57],
        ["2 Corinthians", 2, 14],
        ["Ephesians", 5, 20],
        ["Philippians", 4, 6],
        ["Colossians", 2, 7],
        ["Colossians", 3, 15],
        ["Colossians", 3, 17],
        ["1 Thessalonians", 5, 18],
        ["2 Thessalonians", 2, 13],
        ["1 Timothy", 4, 4],
        ["Hebrews", 13, 15],
        ["James", 1, 17]
    ],

    afraid: [
        ["Deuteronomy", 31, 6],
        ["Deuteronomy", 31, 8],
        ["Joshua", 1, 9],
        ["Judges", 6, 23],
        ["1 Samuel", 23, 17],
        ["2 Kings", 6, 16],
        ["2 Chronicles", 20, 15],
        ["Psalm", 3, 6],
        ["Psalm", 23, 4],
        ["Psalm", 27, 1],
        ["Psalm", 27, 3],
        ["Psalm", 34, 4],
        ["Psalm", 34, 7],
        ["Psalm", 46, 2],
        ["Psalm", 46, 3],
        ["Psalm", 56, 3],
        ["Psalm", 56, 4],
        ["Psalm", 91, 4],
        ["Psalm", 91, 5],
        ["Psalm", 91, 11],
        ["Psalm", 118, 6],
        ["Isaiah", 35, 4],
        ["Isaiah", 41, 10],
        ["Isaiah", 41, 13],
        ["Isaiah", 43, 1],
        ["Isaiah", 43, 2],
        ["Isaiah", 43, 5],
        ["Jeremiah", 1, 8],
        ["Matthew", 10, 28],
        ["Matthew", 14, 27],
        ["John", 14, 1],
        ["John", 14, 27],
        ["2 Timothy", 1, 7],
        ["Hebrews", 13, 6],
        ["1 John", 4, 18]
    ],

    hopeful: [
        ["Psalm", 27, 13],
        ["Psalm", 31, 24],
        ["Psalm", 33, 18],
        ["Psalm", 39, 7],
        ["Psalm", 42, 5],
        ["Psalm", 42, 11],
        ["Psalm", 43, 5],
        ["Psalm", 71, 5],
        ["Psalm", 119, 81],
        ["Psalm", 130, 5],
        ["Psalm", 130, 7],
        ["Proverbs", 23, 18],
        ["Isaiah", 40, 31],
        ["Isaiah", 41, 10],
        ["Isaiah", 43, 18],
        ["Isaiah", 43, 19],
        ["Isaiah", 49, 23],
        ["Isaiah", 54, 10],
        ["Isaiah", 55, 12],
        ["Jeremiah", 17, 7],
        ["Jeremiah", 29, 11],
        ["Lamentations", 3, 21],
        ["Lamentations", 3, 22],
        ["Lamentations", 3, 23],
        ["Lamentations", 3, 24],
        ["Romans", 5, 3],
        ["Romans", 5, 4],
        ["Romans", 5, 5],
        ["Romans", 8, 24],
        ["Romans", 12, 12],
        ["Romans", 15, 13],
        ["2 Corinthians", 4, 16],
        ["2 Corinthians", 4, 17],
        ["Hebrews", 6, 19],
        ["1 Peter", 1, 3]
    ]

};


const feelingNames = {

    happy: "😊 HAPPY",

    sad: "😔 SAD",

    anxious: "😟 ANXIOUS",

    angry: "😡 ANGRY",

    lonely: "🥺 LONELY",

    grateful: "🙏 GRATEFUL",

    afraid: "😨 AFRAID",

    hopeful: "❤️ HOPEFUL"

};


let currentFeeling = null;
let currentFeelingVerse = null;

// Keeps track of verses already shown
// for each feeling.
let feelingQueues = {};


// Create a shuffled copy of an array
function shuffleArray(array) {

    const shuffled = [...array];

    for (
        let i = shuffled.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            shuffled[i],
            shuffled[j]
        ] = [
            shuffled[j],
            shuffled[i]
        ];

    }

    return shuffled;
}


// Get the next verse without repeating
function getNextFeelingVerse(
    feeling
) {

    // If there is no queue yet,
    // create one.
    if (
        !feelingQueues[feeling] ||
        feelingQueues[feeling].length === 0
    ) {

        feelingQueues[feeling] =
            shuffleArray(
                feelingVerses[feeling]
            );

    }

    return feelingQueues[feeling].pop();

}


// ============================================
// FIND VERSE
// ============================================

function findVerse(
    bookName,
    chapterNumber,
    verseNumber
) {

    return allVerses.find(
        verse =>
            verse.book === bookName &&
            Number(verse.chapter) ===
                Number(chapterNumber) &&
            Number(verse.verse) ===
                Number(verseNumber)
    );

}


// ============================================
// SHOW FEELING VERSE
// ============================================

function showFeelingVerse(
    feeling
) {

    if (
        !feelingVerses[feeling] ||
        feelingVerses[feeling].length === 0
    ) {
        return;
    }

    currentFeeling =
        feeling;

    const reference =
        getNextFeelingVerse(
            feeling
        );

    const verse =
        findVerse(
            reference[0],
            reference[1],
            reference[2]
        );

    currentFeelingVerse = verse;

    if (!verse) {
        console.error(
            "Could not find:",
            reference
        );

        return;
    }

    document
        .getElementById(
            "feeling-name"
        )
        .textContent =
        feelingNames[feeling];

    document
        .getElementById(
            "feeling-reference"
        )
        .textContent =
        `${verse.book} ${verse.chapter}:${verse.verse}`;

    document
        .getElementById(
            "feeling-text"
        )
        .textContent =
        verse.text;

    document
        .getElementById(
            "feeling-result"
        )
        .classList.remove(
            "hidden"
        );

}

// ============================================
// SAVE FEELING VERSE
// ============================================

function saveFeelingVerse() {

    if (!currentFeelingVerse) {
        return;
    }

    const verse =
        currentFeelingVerse;

    const highlights =
        getHighlights();

    const key =
        makeHighlightKey(
            verse.book,
            verse.chapter,
            verse.verse
        );

    highlights[key] =
        verse;

    saveHighlights(
        highlights
    );

    loadHighlights();

}

// ============================================
// FEELING BUTTONS
// ============================================

document
    .querySelectorAll(".feeling")
    .forEach(button => {

        button.addEventListener(
            "pointerup",
            () => {

                const feeling =
                    button.dataset.feeling;

                showFeelingVerse(
                    feeling
                );

            }
        );

    });


// ============================================
// ANOTHER VERSE
// ============================================

document
    .getElementById(
        "another-feeling-verse"
    )
    .addEventListener(
        "click",
        () => {

            if (currentFeeling) {

                showFeelingVerse(
                    currentFeeling
                );

            }

        }
    );

// Save feeling verse

document
    .getElementById(
        "save-feeling-verse"
    )
    .addEventListener(
        "pointerup",
        saveFeelingVerse
    );


function searchBible() {

    const input =
        document.getElementById(
            "bible-search-input"
        );

    const resultsContainer =
        document.getElementById(
            "search-results"
        );

    const query =
        input.value
            .trim()
            .toLowerCase();

    resultsContainer.innerHTML = "";

    if (!query) {
        searchResults = [];
        currentSearchPage = 1;
        return;
    }

    // Search for a specific Bible reference
    const referenceMatch =
        query.match(
            /^(.+?)\s+(\d+):(\d+)$/
        );

    if (referenceMatch) {

        const bookName =
            referenceMatch[1]
                .trim()
                .toLowerCase();

        const chapterNumber =
            Number(
                referenceMatch[2]
            );

        const verseNumber =
            Number(
                referenceMatch[3]
            );

        searchResults =
            allVerses.filter(
                verse =>
                    verse.book
                        .toLowerCase() ===
                        bookName &&
                    verse.chapter ===
                        chapterNumber &&
                    verse.verse ===
                        verseNumber
            );

    } else {

        // Normal word / phrase search
        searchResults =
            allVerses.filter(
                verse =>
                    verse.text
                        .toLowerCase()
                        .includes(query)
            );
    }

    currentSearchPage = 1;

    displaySearchResults();
}


function openSearchVerse(verse) {

    const book =
        getBookByName(
            verse.book
        );

    if (!book) {
        return;
    }

    const chapter =
        book.chapters.find(
            chapter =>
                (chapter.chapter ??
                    chapter.number) ===
                verse.chapter
        );

    if (!chapter) {
        return;
    }

    selectedBook = book;

    document
        .getElementById(
            "book-selection"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "chapter-selection"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "reading-screen"
        )
        .classList.remove("hidden");

    document
        .getElementById(
            "back-to-books"
        )
        .classList.remove("hidden");

    document
        .getElementById(
            "bible-title"
        )
        .textContent =
        book.englishName;

    openChapter(
        chapter,
        verse.chapter
    );

    const verseElements =
        document.querySelectorAll(
            "#verse-list .verse"
        );

    const targetVerse =
        Array.from(
            verseElements
        ).find(
            element =>
                element.querySelector(
                    ".verse-number"
                ).textContent ==
                verse.verse
        );

    if (targetVerse) {

        targetVerse.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        targetVerse.classList.add(
            "highlighted"
        );

        setTimeout(
            () => {
                if (
                    !isHighlighted(
                        makeHighlightKey(
                            verse.book,
                            verse.chapter,
                            verse.verse
                        )
                    )
                ) {
                    targetVerse.classList.remove(
                        "highlighted"
                    );
                }
            },
            2000
        );
    }
}


function displaySearchResults() {

    const resultsContainer =
        document.getElementById(
            "search-results"
        );

    resultsContainer.innerHTML = "";

    if (searchResults.length === 0) {

        resultsContainer.innerHTML = `
            <div class="search-result">
                No verses found.
            </div>
        `;

        return;
    }

    const startIndex =
        (currentSearchPage - 1) *
        SEARCH_RESULTS_PER_PAGE;

    const endIndex =
        startIndex +
        SEARCH_RESULTS_PER_PAGE;

    const pageResults =
        searchResults.slice(
            startIndex,
            endIndex
        );

    pageResults.forEach(
        verse => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "search-result";

            item.addEventListener(
                "pointerup",
                () => {
                    openSearchVerse(verse);
                }
            );

            item.innerHTML = `
                <div class="search-result-reference">
                    ${verse.book}
                    ${verse.chapter}:${verse.verse}
                </div>

                <div class="search-result-text">
                    ${verse.text}
                </div>

                <button class="search-save-button">
                    🔖 Save Verse
                </button>
            `;

            const saveButton =
                item.querySelector(
                    ".search-save-button"
                );

            saveButton.addEventListener(
                "pointerup",
                (event) => {

                    event.stopPropagation();

                    const highlights =
                        getHighlights();

                    const key =
                        makeHighlightKey(
                            verse.book,
                            verse.chapter,
                            verse.verse
                        );

                    highlights[key] =
                        verse;

                    saveHighlights(
                        highlights
                    );

                    loadHighlights();

                    saveButton.textContent =
                        "✓ Saved";
                }
            );

            resultsContainer.appendChild(
                item
            );
        }
    );

    const totalPages =
        Math.ceil(
            searchResults.length /
            SEARCH_RESULTS_PER_PAGE
        );

    const pagination =
        document.createElement(
            "div"
        );

    pagination.className =
        "search-pagination";

    pagination.innerHTML = `
        <button
            id="previous-search-page"
            ${currentSearchPage === 1 ? "disabled" : ""}
        >
            ← Previous
        </button>

        <span>
            Page ${currentSearchPage} of ${totalPages}
        </span>

        <button
            id="next-search-page"
            ${currentSearchPage === totalPages ? "disabled" : ""}
        >
            Next →
        </button>
    `;

    resultsContainer.appendChild(
        pagination
    );

    document
        .getElementById(
            "previous-search-page"
        )
        .addEventListener(
            "pointerup",
            () => {
                if (currentSearchPage > 1) {
                    currentSearchPage--;
                    displaySearchResults();
                }
            }
        );

    document
        .getElementById(
            "next-search-page"
        )
        .addEventListener(
            "pointerup",
            () => {
                if (
                    currentSearchPage <
                    totalPages
                ) {
                    currentSearchPage++;
                    displaySearchResults();
                }
            }
        );
}

document
    .getElementById(
        "bible-search-button"
    )
    .addEventListener(
        "pointerup",
        searchBible
    );

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js")
        .then(() => {
            console.log("Service worker registered.");
        })
        .catch(error => {
            console.error(
                "Service worker registration failed:",
                error
            );
        });
}