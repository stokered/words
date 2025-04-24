console.log("script.js loaded!");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAtow4_eedoVN1W4p4BQyOVd8tFR9_U5uo",
  authDomain: "sams-dictionary.firebaseapp.com",
  databaseURL: "https://sams-dictionary-default-rtdb.firebaseio.com",
  projectId: "sams-dictionary",
  storageBucket: "sams-dictionary.appspot.com",
  messagingSenderId: "650440795542",
  appId: "1:650440795542:web:b2e0bed7b33785ba3669b7",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const wordsRef = ref(db, "words");

let words = [],
  jsonWords = [],
  firebaseWords = [],
  sortedWords = [];
let currentIndex = 0;
const wordsPerLoad = 20;
let wordsLoaded = false;

function loadWordsFromJSON() {
  return fetch("./words.json")
    .then((response) => response.json())
    .then((data) => {
      jsonWords = data;
    });
}

function loadWordsFromFirebase() {
  return new Promise((resolve) => {
    onValue(wordsRef, (snapshot) => {
      const data = snapshot.val();
      firebaseWords = [];
      for (let id in data) {
        firebaseWords.push(data[id]);
      }
      resolve();
    });
  });
}

async function loadAllWords() {
  await loadWordsFromJSON();
  await loadWordsFromFirebase();
  words = [...jsonWords, ...firebaseWords];
  wordsLoaded = true;
  console.log(`✅ Loaded ${words.length} words total`);
}

function addNewWord(e) {
  e.preventDefault();
  const word = document.getElementById("newWord").value.trim();
  const wordClass = document.getElementById("newClass").value;
  const definition = document.getElementById("newDefinition").value.trim();
  if (!word || !wordClass || !definition) return;

  const newEntry = { word, class: wordClass, definition };
  push(wordsRef, newEntry);
  e.target.reset();
  document.getElementById("addWordSection").style.display = "none";
  showToast(`✨ Added "${word}" to the cloud!`);
}

function showRandomWord() {
  if (!wordsLoaded || words.length === 0) return;
  const randomIndex = Math.floor(Math.random() * words.length);
  const entry = words[randomIndex];
  const output = document.getElementById("output");
  output.innerHTML = `<div><strong>${entry.word}</strong> (${entry.class}): ${entry.definition}</div>`;
  output.style.display = "block";
}

function initShowAllWords(filtered = words) {
  currentIndex = 0;
  sortedWords = [...filtered].sort((a, b) => a.word.localeCompare(b.word));
  const output = document.getElementById("output");
  output.innerHTML = "";
  output.style.display = "block";
  loadMoreWords();
}

function loadMoreWords() {
  const output = document.getElementById("output");
  const nextWords = sortedWords.slice(
    currentIndex,
    currentIndex + wordsPerLoad
  );
  nextWords.forEach((entry) => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${entry.word}</strong> (${entry.class}): ${entry.definition}`;
    output.appendChild(div);
  });
  currentIndex += wordsPerLoad;
}

function handleScroll() {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
    currentIndex < sortedWords.length
  ) {
    loadMoreWords();
  }
}

function handleSearch() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = words.filter(
    (entry) =>
      entry.word.toLowerCase().startsWith(query) ||
      entry.definition.toLowerCase().includes(query)
  );
  initShowAllWords(filtered);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function toggleAddForm() {
  const form = document.getElementById("addWordSection");
  form.style.display = form.style.display === "block" ? "none" : "block";
}

window.onload = async () => {
  await loadAllWords();
  document
    .getElementById("randomBtn")
    .addEventListener("click", showRandomWord);
  document
    .getElementById("allBtn")
    .addEventListener("click", () => initShowAllWords());
  document.getElementById("addWordForm").addEventListener("submit", addNewWord);
  document
    .getElementById("searchInput")
    .addEventListener("input", handleSearch);
  document
    .getElementById("toggleAddForm")
    .addEventListener("click", toggleAddForm);
  window.addEventListener("scroll", handleScroll);
  document.getElementById("output").style.display = "none";
};
