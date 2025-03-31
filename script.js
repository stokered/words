import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAtow4_eedoVN1W4p4BQyOVd8tFR9_U5uo",
  authDomain: "sams-dictionary.firebaseapp.com",
  databaseURL: "https://sams-dictionary-default-rtdb.firebaseio.com",
  projectId: "sams-dictionary",
  storageBucket: "sams-dictionary.appspot.com",
  messagingSenderId: "650440795542",
  appId: "1:650440795542:web:b2e0bed7b33785ba3669b7"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();
const wordsRef = ref(db, 'words');

// 🌍 Word storage
let currentUser = null;
let words = [];
let firebaseWords = [];
let jsonWords = [];
let sortedWords = [];
let currentIndex = 0;
const wordsPerLoad = 20;
let wordsLoaded = false;

// 📁 Load JSON words
function loadWordsFromJSON() {
  return fetch('./words.json')
    .then(response => response.json())
    .then(data => {
      jsonWords = data;
    });
}

// ☁️ Load Firebase words
function loadWordsFromFirebase() {
  return new Promise(resolve => {
    onValue(wordsRef, snapshot => {
      const data = snapshot.val();
      firebaseWords = [];
      for (let id in data) {
        firebaseWords.push(data[id]);
      }
      resolve();
    });
  });
}

// 🧠 Merge both
async function loadAllWords() {
  await loadWordsFromJSON();
  await loadWordsFromFirebase();
  words = [...jsonWords, ...firebaseWords];
  wordsLoaded = true;
  console.log(`✅ Loaded ${words.length} words total`);
  initShowAllWords();
}

// 🔐 Login
function loginUser(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => showToast('✅ Logged in!'))
    .catch(error => showToast('❌ ' + error.message));
}

// 🔐 Auth state check
onAuthStateChanged(auth, user => {
  currentUser = user;
  const status = document.getElementById('loginStatus');
  const addSection = document.getElementById('addWordSection');

  if (user) {
    status.textContent = `Logged in as ${user.email}`;
    addSection.style.display = 'block';
  } else {
    status.textContent = 'not logged in';
    addSection.style.display = 'none';
  }
});

// ➕ Add word
function addNewWord(e) {
  e.preventDefault();
  if (!currentUser) return showToast("Please log in to add words.");
  const word = document.getElementById('newWord').value.trim();
  const wordClass = document.getElementById('newClass').value;
  const definition = document.getElementById('newDefinition').value.trim();
  if (!word || !wordClass || !definition) return;

  const newEntry = { word, class: wordClass, definition };
  push(wordsRef, newEntry);
  e.target.reset();
  showToast(`✨ Added "${word}" to the cloud!`);
}

// 🎲 Show random word
function showRandomWord() {
  if (words.length === 0) return;
  const randomIndex = Math.floor(Math.random() * words.length);
  displayWord(words[randomIndex]);
}

// 📖 Show one word
function displayWord(entry) {
  const output = document.getElementById('output');
  output.innerHTML = `<strong>${entry.word}</strong> (${entry.class}): ${entry.definition}`;
}

// 📚 Show all (initial & filtered)
function initShowAllWords(filtered = words) {
  currentIndex = 0;
  sortedWords = [...filtered].sort((a, b) => a.word.localeCompare(b.word));
  document.getElementById('output').innerHTML = '';
  loadMoreWords();
}

// ➕ Infinite scroll
function loadMoreWords() {
  const output = document.getElementById('output');
  const nextWords = sortedWords.slice(currentIndex, currentIndex + wordsPerLoad);
  nextWords.forEach(entry => {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${entry.word}</strong> (${entry.class}): ${entry.definition}`;
    output.appendChild(div);
  });
  currentIndex += wordsPerLoad;
}

// 🔍 Search bar
function handleSearch() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = words.filter(entry =>
    entry.word.toLowerCase().startsWith(query) ||
    entry.definition.toLowerCase().includes(query)
  );
  initShowAllWords(filtered);
}

// 🪄 Toast popup
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// 🚀 Init
window.onload = () => {
  loadAllWords();

  document.getElementById('randomBtn').addEventListener('click', () => {
    if (!wordsLoaded) return showToast("⏳ Still loading words...");
    showRandomWord();
  });

  document.getElementById('allBtn').addEventListener('click', () => {
    if (!wordsLoaded) return showToast("⏳ Still loading words...");
    initShowAllWords();
  });

  document.getElementById('addWordForm').addEventListener('submit', addNewWord);
  document.getElementById('loginForm').addEventListener('submit', loginUser);
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  window.addEventListener('scroll', handleScroll);
  document.getElementById('email').focus();
};

// 🌀 Scroll trigger
function handleScroll() {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
    currentIndex < sortedWords.length
  ) {
    loadMoreWords();
  }
}
