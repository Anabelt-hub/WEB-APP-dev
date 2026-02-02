"use strict";

const STORAGE_KEY = "watchlist_records_v1";

const el = (id) => document.getElementById(id);

// Tabs / views
const tabList = el("tabList");
const tabForm = el("tabForm");
const tabStats = el("tabStats");

const viewList = el("viewList");
const viewForm = el("viewForm");
const viewStats = el("viewStats");

// List controls
const recordsTbody = el("recordsTbody");
const searchInput = el("searchInput");
const statusFilter = el("statusFilter");
const newBtn = el("newBtn");

// Form controls
const recordForm = el("recordForm");
const formTitle = el("formTitle");
const recordId = el("recordId");
const titleInput = el("title");
const typeInput = el("type");
const genreInput = el("genre");
const yearInput = el("year");
const ratingInput = el("rating");
const statusInput = el("status");
const notesInput = el("notes");
const cancelBtn = el("cancelBtn");
const deleteBtn = el("deleteBtn");
const formError = el("formError");

// Stats controls
const statTotal = el("statTotal");
const statCompleted = el("statCompleted");
const statAvgRating = el("statAvgRating");
const statTopGenre = el("statTopGenre");
const statusBreakdown = el("statusBreakdown");

// In-memory data
let records = [];

// ---------- Seed data (30+ records) ----------
function seedRecords() {
  const seed = [
    { title: "Inception", type: "Movie", genre: "Sci-Fi", year: 2010, rating: 9, status: "Completed", notes: "" },
    { title: "The Dark Knight", type: "Movie", genre: "Action", year: 2008, rating: 10, status: "Completed", notes: "" },
    { title: "Interstellar", type: "Movie", genre: "Sci-Fi", year: 2014, rating: 9, status: "Completed", notes: "" },
    { title: "The Office", type: "TV", genre: "Comedy", year: 2005, rating: 8, status: "Completed", notes: "" },
    { title: "Breaking Bad", type: "TV", genre: "Drama", year: 2008, rating: 10, status: "Completed", notes: "" },
    { title: "Stranger Things", type: "TV", genre: "Sci-Fi", year: 2016, rating: 8, status: "Watching", notes: "" },
    { title: "The Mandalorian", type: "TV", genre: "Sci-Fi", year: 2019, rating: 8, status: "Watching", notes: "" },
    { title: "Parasite", type: "Movie", genre: "Thriller", year: 2019, rating: 9, status: "Completed", notes: "" },
    { title: "The Godfather", type: "Movie", genre: "Crime", year: 1972, rating: 10, status: "Planned", notes: "" },
    { title: "Pulp Fiction", type: "Movie", genre: "Crime", year: 1994, rating: 9, status: "Planned", notes: "" },
    { title: "Spirited Away", type: "Movie", genre: "Animation", year: 2001, rating: 9, status: "Completed", notes: "" },
    { title: "The Social Network", type: "Movie", genre: "Drama", year: 2010, rating: 8, status: "Completed", notes: "" },
    { title: "Arcane", type: "TV", genre: "Animation", year: 2021, rating: 9, status: "Completed", notes: "" },
    { title: "Game of Thrones", type: "TV", genre: "Fantasy", year: 2011, rating: 7, status: "Dropped", notes: "Stopped mid-series" },
    { title: "The Boys", type: "TV", genre: "Action", year: 2019, rating: 8, status: "Watching", notes: "" },
    { title: "Dune", type: "Movie", genre: "Sci-Fi", year: 2021, rating: 8, status: "Completed", notes: "" },
    { title: "Dune: Part Two", type: "Movie", genre: "Sci-Fi", year: 2024, rating: 9, status: "Planned", notes: "" },
    { title: "Chernobyl", type: "TV", genre: "Drama", year: 2019, rating: 10, status: "Completed", notes: "" },
    { title: "The Bear", type: "TV", genre: "Drama", year: 2022, rating: 8, status: "Watching", notes: "" },
    { title: "Whiplash", type: "Movie", genre: "Drama", year: 2014, rating: 9, status: "Completed", notes: "" },
    { title: "Mad Max: Fury Road", type: "Movie", genre: "Action", year: 2015, rating: 9, status: "Completed", notes: "" },
    { title: "The Matrix", type: "Movie", genre: "Sci-Fi", year: 1999, rating: 10, status: "Completed", notes: "" },
    { title: "Black Mirror", type: "TV", genre: "Sci-Fi", year: 2011, rating: 8, status: "Planned", notes: "" },
    { title: "Better Call Saul", type: "TV", genre: "Drama", year: 2015, rating: 9, status: "Planned", notes: "" },
    { title: "Blade Runner 2049", type: "Movie", genre: "Sci-Fi", year: 2017, rating: 9, status: "Completed", notes: "" },
    { title: "The Lord of the Rings", type: "Movie", genre: "Fantasy", year: 2001, rating: 10, status: "Completed", notes: "" },
    { title: "The Witcher", type: "TV", genre: "Fantasy", year: 2019, rating: 7, status: "Watching", notes: "" },
    { title: "Knives Out", type: "Movie", genre: "Mystery", year: 2019, rating: 8, status: "Completed", notes: "" },
    { title: "Severance", type: "TV", genre: "Thriller", year: 2022, rating: 9, status: "Planned", notes: "" },
    { title: "The Grand Budapest Hotel", type: "Movie", genre: "Comedy", year: 2014, rating: 8, status: "Completed", notes: "" },
  ];

  return seed.map((r) => ({
    id: crypto.randomUUID(),
    ...r
  }));
}

// ---------- Storage ----------
function loadRecords() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    records = seedRecords();          // ensures 30+ records on first run
    saveRecords();
    return;
  }

  try {
    records = JSON.parse(raw);
    if (!Array.isArray(records) || records.length < 30) {
      // safety: if storage corrupted or missing required minimum, re-seed
      records = seedRecords();
      saveRecords();
    }
  } catch {
    records = seedRecords();
    saveRecords();
  }
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// ---------- View helpers ----------
function setActiveTab(active) {
  for (const t of [tabList, tabForm, tabStats]) t.classList.remove("active");
  active.classList.add("active");
}

function showView(which) {
  viewList.classList.add("hidden");
  viewForm.classList.add("hidden");
  viewStats.classList.add("hidden");
  which.classList.remove("hidden");
}

// ---------- CRUD ----------
function addRecord(data) {
  records.unshift({ id: crypto.randomUUID(), ...data });
  saveRecords();
}

function updateRecord(id, data) {
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return;
  records[idx] = { ...records[idx], ...data };
  saveRecords();
}

function deleteRecord(id) {
  records = records.filter((r) => r.id !== id);
  saveRecords();
}

// ---------- Validation ----------
function validateFormData(data) {
  const errs = [];

  if (!data.title || data.title.trim().length === 0) errs.push("Title is required.");
  if (!data.type) errs.push("Type is required.");
  if (!data.genre || data.genre.trim().length === 0) errs.push("Genre is required.");

  if (!Number.isInteger(data.year)) errs.push("Year must be a whole number.");
  if (data.year < 1900 || data.year > 2100) errs.push("Year must be between 1900 and 2100.");

  if (!data.status) errs.push("Status is required.");

  if (data.rating !== null) {
    if (!Number.isInteger(data.rating)) errs.push("Rating must be a whole number.");
    if (data.rating < 1 || data.rating > 10) errs.push("Rating must be between 1 and 10.");
  }

  return errs;
}

// ---------- Rendering ----------
function getFilteredRecords() {
  const q = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;

  return records.filter((r) => {
    const matchesText = r.title.toLowerCase().includes(q);
    const matchesStatus = status === "ALL" ? true : r.status === status;
    return matchesText && matchesStatus;
  });
}

function renderList() {
  const filtered = getFilteredRecords();

  recordsTbody.innerHTML = "";
  for (const r of filtered) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(r.title)}</td>
      <td>${escapeHtml(r.type)}</td>
      <td>${escapeHtml(r.genre)}</td>
      <td>${r.year}</td>
      <td>${r.rating ?? "—"}</td>
      <td>${escapeHtml(r.status)}</td>
      <td class="right">
        <button data-action="edit" data-id="${r.id}">Edit</button>
        <button data-action="delete" data-id="${r.id}" class="danger">Delete</button>
      </td>
    `;
    recordsTbody.appendChild(tr);
  }

  renderStats(); // keep stats accurate even when user stays on list
}

function renderStats() {
  statTotal.textContent = String(records.length);

  const completed = records.filter((r) => r.status === "Completed");
  statCompleted.textContent = String(completed.length);

  const completedWithRating = completed.filter((r) => Number.isInteger(r.rating));
  if (completedWithRating.length === 0) {
    statAvgRating.textContent = "—";
  } else {
    const avg = completedWithRating.reduce((sum, r) => sum + r.rating, 0) / completedWithRating.length;
    statAvgRating.textContent = avg.toFixed(1);
  }

  const genreCounts = new Map();
  for (const r of records) {
    const g = r.genre.trim();
    genreCounts.set(g, (genreCounts.get(g) || 0) + 1);
  }
  let topGenre = "—";
  let topCount = 0;
  for (const [g, c] of genreCounts.entries()) {
    if (c > topCount) {
      topCount = c;
      topGenre = g;
    }
  }
  statTopGenre.textContent = topGenre;

  const statuses = ["Planned", "Watching", "Completed", "Dropped"];
  statusBreakdown.innerHTML = "";
  for (const s of statuses) {
    const count = records.filter((r) => r.status === s).length;
    const li = document.createElement("li");
    li.textContent = `${s}: ${count}`;
    statusBreakdown.appendChild(li);
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---------- Form helpers ----------
function clearForm() {
  recordId.value = "";
  titleInput.value = "";
  typeInput.value = "";
  genreInput.value = "";
  yearInput.value = "";
  ratingInput.value = "";
  statusInput.value = "";
  notesInput.value = "";
  formError.classList.add("hidden");
  formError.textContent = "";
  deleteBtn.classList.add("hidden");
  formTitle.textContent = "Add Record";
}

function fillForm(r) {
  recordId.value = r.id;
  titleInput.value = r.title;
  typeInput.value = r.type;
  genreInput.value = r.genre;
  yearInput.value = r.year;
  ratingInput.value = r.rating ?? "";
  statusInput.value = r.status;
  notesInput.value = r.notes ?? "";
  deleteBtn.classList.remove("hidden");
  formTitle.textContent = "Edit Record";
}

// ---------- Events ----------
function goList() {
  setActiveTab(tabList);
  showView(viewList);
  renderList();
}

function goForm() {
  setActiveTab(tabForm);
  showView(viewForm);
}

function goStats() {
  setActiveTab(tabStats);
  showView(viewStats);
  renderStats();
}

tabList.addEventListener("click", goList);
tabForm.addEventListener("click", () => {
  clearForm();
  goForm();
});
tabStats.addEventListener("click", goStats);

newBtn.addEventListener("click", () => {
  clearForm();
  goForm();
});

searchInput.addEventListener("input", renderList);
statusFilter.addEventListener("change", renderList);

recordsTbody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = btn.dataset.id;
  const action = btn.dataset.action;
  const rec = records.find((r) => r.id === id);

  if (action === "edit" && rec) {
    fillForm(rec);
    goForm();
  }

  if (action === "delete" && rec) {
    const ok = confirm(`Delete "${rec.title}"? This cannot be undone.`);
    if (!ok) return;
    deleteRecord(id);
    renderList();
  }
});

recordForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    title: titleInput.value.trim(),
    type: typeInput.value,
    genre: genreInput.value.trim(),
    year: Number.parseInt(yearInput.value, 10),
    rating: ratingInput.value.trim() === "" ? null : Number.parseInt(ratingInput.value, 10),
    status: statusInput.value,
    notes: notesInput.value.trim(),
  };

  const errs = validateFormData(data);
  if (errs.length > 0) {
    formError.textContent = errs.join(" ");
    formError.classList.remove("hidden");
    return;
  }

  const id = recordId.value;
  if (id) updateRecord(id, data);
  else addRecord(data);

  goList();
});

cancelBtn.addEventListener("click", goList);

deleteBtn.addEventListener("click", () => {
  const id = recordId.value;
  if (!id) return;

  const rec = records.find((r) => r.id === id);
  const ok = confirm(`Delete "${rec?.title ?? "this record"}"? This cannot be undone.`);
  if (!ok) return;

  deleteRecord(id);
  goList();
});

// ---------- Init ----------
loadRecords();
goList();
