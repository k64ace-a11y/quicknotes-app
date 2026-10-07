const noteForm = document.querySelector('#note-form');
const noteInput = document.querySelector('#note-input');
const noteCategory = document.querySelector('#note-category');
const searchInput = document.querySelector('#search-input');
const notesList = document.querySelector('#notes-list');
const noteCount = document.querySelector('#note-count');
const errorMessage = document.querySelector('#error-message');
const clearAllButton = document.querySelector('#clear-all');

const STORAGE_KEY = 'quicknotes.notes';

let notes = loadNotes();

function loadNotes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(note => (
      note &&
      typeof note.id === 'string' &&
      typeof note.text === 'string' &&
      typeof note.category === 'string' &&
      typeof note.createdAt === 'string'
    ));
  } catch (error) {
    console.error('Could not load notes from localStorage:', error);
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function createNoteElement(note) {
  const li = document.createElement('li');
  li.className = `note-card category-${note.category.toLowerCase()}`;
  li.dataset.id = note.id;

  const text = document.createElement('p');
  text.className = 'note-text';
  text.textContent = note.text;

  const meta = document.createElement('div');
  meta.className = 'note-meta';

  const category = document.createElement('span');
  category.className = 'note-category';
  category.textContent = note.category;

  const date = document.createElement('span');
  date.className = 'note-date';
  date.textContent = note.createdAt;

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-btn';
  deleteButton.textContent = 'Delete';
  deleteButton.dataset.id = note.id;

  meta.append(category, date, deleteButton);
  li.append(text, meta);

  return li;
}

function getVisibleNotes() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    return notes;
  }

  const searchWords = query.split(/\s+/);

  return notes.filter(note => {
    const noteText = note.text.toLowerCase();
    return searchWords.every(word => noteText.includes(word));
  });
}

function updateCount() {
  const count = notes.length;

  if (count === 0) {
    noteCount.textContent = 'You have no notes yet.';
  } else if (count === 1) {
    noteCount.textContent = 'You have 1 note.';
  } else {
    noteCount.textContent = `You have ${count} notes.`;
  }
}

function render() {
  notesList.textContent = '';

  const visibleNotes = getVisibleNotes();

  if (visibleNotes.length === 0) {
    if (notes.length > 0 && searchInput.value.trim()) {
      const emptyMessage = document.createElement('li');
      emptyMessage.className = 'empty-search';
      emptyMessage.textContent = 'No notes match your search.';
      notesList.append(emptyMessage);
    }
  } else {
    visibleNotes.forEach(note => {
      notesList.append(createNoteElement(note));
    });
  }

  updateCount();
}

function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = '';
}

function addNote(event) {
  event.preventDefault();

  const text = noteInput.value.trim();
  const category = noteCategory.value;

  if (!text) {
    showError('Please type a note first.');
    return;
  }

  if (text.length > 200) {
    showError('Notes must be 200 characters or fewer.');
    return;
  }

  clearError();

  notes.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: text,
    category: category,
    createdAt: new Date().toLocaleString()
  });

  noteInput.value = '';
  noteCategory.value = 'Personal';

  saveNotes();
  render();
  noteInput.focus();
}

function deleteNote(id) {
  notes = notes.filter(note => note.id !== id);
  saveNotes();
  render();
}

function clearAllNotes() {
  if (notes.length === 0) {
    return;
  }

  if (confirm('Delete all notes?')) {
    notes = [];
    saveNotes();
    render();
  }
}

noteForm.addEventListener('submit', addNote);

searchInput.addEventListener('input', render);

notesList.addEventListener('click', event => {
  const deleteButton = event.target.closest('.delete-btn');

  if (deleteButton) {
    deleteNote(deleteButton.dataset.id);
  }
});

clearAllButton.addEventListener('click', clearAllNotes);

render();