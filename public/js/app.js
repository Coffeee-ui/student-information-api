import { StudentApi } from './api.js';

// Application state
const state = {
  students: [],
  editingId: null,
  isSubmitting: false,
  deleteTarget: null,
};

// DOM Elements
const studentForm = document.getElementById('student-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const studentsTableBody = document.getElementById('students-table-body');
const tableContainer = document.getElementById('table-wrapper');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');
const errorState = document.getElementById('error-state');
const errorMessageEl = document.getElementById('error-message');
const retryBtn = document.getElementById('retry-btn');
const totalStudentsBadge = document.getElementById('total-students-count');
const systemStatusDot = document.getElementById('status-dot');
const systemStatusText = document.getElementById('status-text');
const toastContainer = document.getElementById('toast-container');

// Delete modal elements
const deleteModal = document.getElementById('delete-modal');
const deleteTargetName = document.getElementById('delete-target-name');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

// Form input fields
const studentNumberInput = document.getElementById('student_number');
const firstNameInput = document.getElementById('first_name');
const lastNameInput = document.getElementById('last_name');
const courseInput = document.getElementById('course');
const yearLevelInput = document.getElementById('year_level');

// ==========================================
// Toast Notification Utility
// ==========================================
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button type="button" aria-label="Close" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:1.1rem;">&times;</button>
  `;

  toast.querySelector('button').addEventListener('click', () => {
    toast.remove();
  });

  toastContainer.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 4000);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// Render Student List & States
// ==========================================
function updateViews() {
  totalStudentsBadge.textContent = state.students.length;

  if (state.students.length === 0) {
    tableContainer.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  tableContainer.style.display = 'block';

  studentsTableBody.innerHTML = state.students
    .map((student) => `
      <tr id="row-${student.id}">
        <td><strong>${escapeHtml(student.student_number)}</strong></td>
        <td>${escapeHtml(student.last_name)}, ${escapeHtml(student.first_name)}</td>
        <td><span class="badge badge-course">${escapeHtml(student.course)}</span></td>
        <td><span class="badge badge-year">Year ${student.year_level}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn btn-secondary btn-sm edit-btn" data-id="${student.id}" title="Edit student">
              Edit
            </button>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${student.id}" title="Delete student">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `)
    .join('');
}

// ==========================================
// Fetch Students (Read Operation)
// ==========================================
async function loadStudents() {
  loadingState.style.display = 'block';
  errorState.style.display = 'none';
  emptyState.style.display = 'none';
  tableContainer.style.display = 'none';

  try {
    const data = await StudentApi.getAll();
    state.students = Array.isArray(data) ? data : [];
    updateViews();
    setSystemStatus(true);
  } catch (err) {
    console.error('Failed to load students:', err);
    errorMessageEl.textContent = err.message || 'Could not connect to the API server.';
    errorState.style.display = 'block';
    setSystemStatus(false);
  } finally {
    loadingState.style.display = 'none';
  }
}

// ==========================================
// Form Submission (Create & Update Operations)
// ==========================================
async function handleSubmit(e) {
  e.preventDefault();

  const studentNumber = studentNumberInput.value.trim();
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const course = courseInput.value.trim();
  const yearLevel = parseInt(yearLevelInput.value, 10);

  if (!studentNumber || !firstName || !lastName || !course || isNaN(yearLevel) || yearLevel < 1) {
    showToast('Please fill in all fields with valid values.', 'error');
    return;
  }

  const payload = {
    student_number: studentNumber,
    first_name: firstName,
    last_name: lastName,
    course: course,
    year_level: yearLevel,
  };

  setSubmitting(true);

  try {
    if (state.editingId) {
      // Update existing student
      const updated = await StudentApi.update(state.editingId, payload);
      const index = state.students.findIndex((s) => s.id === state.editingId);
      if (index !== -1) {
        state.students[index] = updated;
      }
      showToast(`Student ${updated.student_number} updated successfully!`, 'success');
      resetForm();
    } else {
      // Create new student
      const created = await StudentApi.create(payload);
      state.students.push(created);
      showToast(`Student ${created.student_number} created successfully!`, 'success');
      resetForm();
    }
    updateViews();
  } catch (err) {
    showToast(err.message || 'Operation failed.', 'error');
  } finally {
    setSubmitting(false);
  }
}

function setSubmitting(isSubmitting) {
  state.isSubmitting = isSubmitting;
  submitBtn.disabled = isSubmitting;
  submitBtn.textContent = isSubmitting 
    ? (state.editingId ? 'Saving...' : 'Adding...') 
    : (state.editingId ? 'Update Student' : 'Add Student');
}

// ==========================================
// Edit Mode Handling
// ==========================================
function startEdit(id) {
  const student = state.students.find((s) => s.id === id);
  if (!student) return;

  state.editingId = id;
  studentNumberInput.value = student.student_number;
  firstNameInput.value = student.first_name;
  lastNameInput.value = student.last_name;
  courseInput.value = student.course;
  yearLevelInput.value = student.year_level;

  formTitle.textContent = `Edit Student #${student.id}`;
  submitBtn.textContent = 'Update Student';
  submitBtn.classList.remove('btn-primary');
  submitBtn.classList.add('btn-primary');
  cancelEditBtn.style.display = 'inline-flex';

  // Highlight row and focus first input
  studentNumberInput.focus();
}

function resetForm() {
  state.editingId = null;
  studentForm.reset();
  formTitle.textContent = 'Add New Student';
  submitBtn.textContent = 'Add Student';
  cancelEditBtn.style.display = 'none';
}

// ==========================================
// Delete Handling (Delete Operation with Modal)
// ==========================================
function promptDelete(id) {
  const student = state.students.find((s) => s.id === id);
  if (!student) return;

  state.deleteTarget = student;
  deleteTargetName.textContent = `${student.first_name} ${student.last_name} (${student.student_number})`;
  deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  state.deleteTarget = null;
  deleteModal.classList.add('hidden');
  confirmDeleteBtn.disabled = false;
  confirmDeleteBtn.textContent = 'Delete Record';
}

async function handleConfirmDelete() {
  if (!state.deleteTarget) return;

  const id = state.deleteTarget.id;
  const studentNumber = state.deleteTarget.student_number;

  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.textContent = 'Deleting...';

  try {
    await StudentApi.delete(id);
    state.students = state.students.filter((s) => s.id !== id);
    updateViews();
    showToast(`Student ${studentNumber} was deleted.`, 'success');
    closeDeleteModal();

    // If currently editing this record, reset form
    if (state.editingId === id) {
      resetForm();
    }
  } catch (err) {
    showToast(err.message || 'Failed to delete student.', 'error');
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = 'Delete Record';
  }
}

// ==========================================
// Status & Health Check
// ==========================================
function setSystemStatus(isOnline) {
  if (isOnline) {
    systemStatusDot.className = 'status-dot online';
    systemStatusText.textContent = 'API Connected';
  } else {
    systemStatusDot.className = 'status-dot offline';
    systemStatusText.textContent = 'Offline / Error';
  }
}

// ==========================================
// Event Listeners
// ==========================================
studentForm.addEventListener('submit', handleSubmit);
cancelEditBtn.addEventListener('click', resetForm);
retryBtn.addEventListener('click', loadStudents);

confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
cancelDeleteBtn.addEventListener('click', closeDeleteModal);

// Close modal when clicking backdrop
deleteModal.addEventListener('click', (e) => {
  if (e.target === deleteModal) {
    closeDeleteModal();
  }
});

// Event delegation for table action buttons
studentsTableBody.addEventListener('click', (e) => {
  const editBtn = e.target.closest('.edit-btn');
  const deleteBtn = e.target.closest('.delete-btn');

  if (editBtn) {
    const id = parseInt(editBtn.dataset.id, 10);
    startEdit(id);
  } else if (deleteBtn) {
    const id = parseInt(deleteBtn.dataset.id, 10);
    promptDelete(id);
  }
});

// Initial boot
loadStudents();

