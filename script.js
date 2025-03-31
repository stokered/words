import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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

let currentUser = null;
let words = [];
let sortedWords = [];
let currentIndex = 0;
const wordsPerLoad = 20;

function loadWordsFromFirebase() {
  onValue(wordsRef, snapshot => {
    const data = snapshot.val();
    words = [];
    for (let id in data) {
      words.push(data[id]);
    }
    initShowAllWords();
  });
}

function loginUser(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => showToast('✅ Logged in!'))
    .catch(error => showToast('❌ ' + error.message));
}

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

function displayWord(entry) {
  const output = document.getElementById('output');
  output.innerHTML = `<strong>${entry.word}</strong> (${entry.class}): ${entry.definition}`;
}

function showRandomWord() {
  if (words.length === 0) return;
  const randomIndex = Math.floor(Math.random() * words.length);
  displayWord(words[randomIndex]);
}

function initShowAllWords(filtered = words) {
  currentIndex = 0;
  sortedWords = [...filtered].sort((a, b) => a.word.localeCompare(b.word));
  document.getElementById('output').innerHTML = '';
  loadMoreWords();
}

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

function handleScroll() {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
    currentIndex < sortedWords.length
  ) {
    loadMoreWords();
  }
}

function handleSearch() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = words.filter(entry =>
    entry.word.toLowerCase().startsWith(query) ||
    entry.definition.toLowerCase().includes(query)
  );
  initShowAllWords(filtered);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

window.onload = () => {
  loadWordsFromFirebase();
  document.getElementById('randomBtn').addEventListener('click', showRandomWord);
  document.getElementById('allBtn').addEventListener('click', () => initShowAllWords());
  document.getElementById('addWordForm').addEventListener('submit', addNewWord);
  document.getElementById('loginForm').addEventListener('submit', loginUser);
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  window.addEventListener('scroll', handleScroll);
  document.getElementById('email').focus();
};
