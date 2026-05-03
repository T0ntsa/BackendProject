(function () {
  const token = sessionStorage.getItem("authToken");
  const user = JSON.parse(sessionStorage.getItem("authUser") || "null");

  if (!token || !user) {
    window.location.replace("/login");
    return;
  }

  const state = {
    tasks: [],
    dogs: [],
    trainers: [],
    activeSection: "overview",
    pendingDeleteTaskId: "",
    pendingDeleteDogId: "",
  };

  const labels = {
    admin: "Administrator",
    employee: "Trainer",
    pending: "Pending",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  const $ = (selector) => document.querySelector(selector);

  const idOf = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value.id || value._id || "";
  };

  const currentUserId = () => idOf(user);

  const canCreateTask = () => user.role === "admin";

  const canDeleteTask = () => user.role === "admin";

  const canDeleteDog = () => user.role === "admin";

  const canManageTask = (task) => {
    if (!task) return false;
    return user.role === "admin" || idOf(task.assignedTo) === currentUserId();
  };

  const textOf = (value, fallback) => {
    if (value === undefined || value === null || value === "") return fallback;
    return String(value);
  };

  const escapeHtml = (value) =>
    textOf(value, "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[char],
    );

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-US");
  };

  const toDateInputValue = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const showMessage = (text, type) => {
    const message = $("#app-message");
    message.textContent = text;
    message.className = `alert alert-${type}`;
  };

  const clearMessage = () => {
    const message = $("#app-message");
    message.textContent = "";
    message.className = "alert d-none";
  };

  const apiFetch = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("authUser");
      window.location.replace("/login");
      throw new Error("Your session has expired. Please sign in again.");
    }

    if (!response.ok) {
      throw new Error(
        data.error ||
          data.message ||
          data.msg ||
          "Request failed. Please try again.",
      );
    }

    return data;
  };

  const fillSelect = (select, items, placeholder, getLabel) => {
    select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>`;
    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = idOf(item);
      option.textContent = getLabel(item);
      select.appendChild(option);
    });
  };

  const renderUser = () => {
    $("#current-user-name").textContent = user.fullName || user.email;
    $("#current-user-role").textContent =
      `${labels[user.role] || user.role} · ${user.email}`;
  };

  const renderStats = () => {
    $("#task-count").textContent = state.tasks.length;
    $("#pending-count").textContent = state.tasks.filter(
      (task) => task.status === "pending",
    ).length;
    $("#dog-count").textContent = state.dogs.length;
    $("#trainer-count").textContent = state.trainers.length;
  };

  const renderTasks = () => {
    const body = $("#task-table-body");
    const empty = $("#empty-tasks");
    $("#task-list-meta").textContent = `${state.tasks.length} records`;

    if (!state.tasks.length) {
      body.innerHTML = "";
      empty.classList.remove("d-none");
      return;
    }

    empty.classList.add("d-none");
    body.innerHTML = state.tasks
      .map((task) => {
        const dogName = task.dog ? task.dog.name : "-";
        const trainerName = task.assignedTo ? task.assignedTo.fullName : "-";
        const canEdit = canManageTask(task);
        const priorityLabel =
          labels[task.priority] || task.priority || "Medium";
        const taskTitle = escapeHtml(task.title || "Untitled task");
        const deleteButton = canDeleteTask()
          ? `<button class="btn btn-outline-danger btn-sm" type="button" data-action="delete-task" data-id="${escapeHtml(idOf(task))}" aria-label="Delete task: ${taskTitle}">Delete</button>`
          : "";

        return `
        <tr>
          <td>
            <strong>${taskTitle}</strong>
            <div class="small text-muted">${escapeHtml(priorityLabel)} priority</div>
          </td>
          <td>${escapeHtml(dogName)}</td>
          <td>${escapeHtml(trainerName)}</td>
          <td><span class="badge-soft ${escapeHtml(task.status || "")}">${escapeHtml(labels[task.status] || task.status || "-")}</span></td>
          <td>${escapeHtml(formatDate(task.dueDate))}</td>
          <td class="text-end">
            <div class="task-row-actions">
              <button class="btn btn-outline-success btn-sm" type="button" data-action="edit-task" data-id="${escapeHtml(idOf(task))}" aria-label="Edit task: ${taskTitle}" ${canEdit ? "" : "disabled"}>Edit</button>
              ${deleteButton}
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  };

  const renderDogs = () => {
    const list = $("#dogs-list");
    const empty = $("#empty-dogs");

    if (!state.dogs.length) {
      list.innerHTML = "";
      empty.classList.remove("d-none");
      return;
    }

    empty.classList.add("d-none");
    list.innerHTML = state.dogs
      .map((dog) => {
        const dogName = escapeHtml(dog.name || "Unnamed dog");
        const photoStyle = dog.photo
          ? `style="background-image: linear-gradient(rgba(29, 63, 49, 0.1), rgba(29, 63, 49, 0.1)), url('${escapeHtml(dog.photo)}')"`
          : "";
        const canEdit = user.role === "admin";
        const deleteButton = canDeleteDog()
          ? `<button class="btn btn-outline-danger btn-sm" type="button" data-action="delete-dog" data-id="${escapeHtml(idOf(dog))}" aria-label="Delete dog: ${dogName}">Delete</button>`
          : "";

        return `
        <article class="dog-card">
          <div class="dog-photo" ${photoStyle}></div>
          <div class="dog-card-body">
            <div class="dog-card-header">
              <div class="dog-card-title">
                <h3>${dogName}</h3>
                <div class="dog-meta">${escapeHtml(textOf(dog.breed, "Unknown breed"))} · ${escapeHtml(textOf(dog.age, "-"))} years old</div>
              </div>
              <div class="dog-card-actions">
                <button class="btn btn-outline-success btn-sm" type="button" data-action="edit-dog" data-id="${escapeHtml(idOf(dog))}" aria-label="Edit dog: ${dogName}" ${canEdit ? "" : "disabled"}>Edit</button>
                ${deleteButton}
              </div>
            </div>
            <div class="small text-muted">Owner: ${escapeHtml(textOf(dog.owner, "Not provided"))}</div>
            <p class="dog-notes mt-2 mb-0">${escapeHtml(textOf(dog.notes, "No notes yet"))}</p>
          </div>
        </article>
      `;
      })
      .join("");
  };

  const renderSelects = () => {
    fillSelect(
      $("#task-dog"),
      state.dogs,
      "Choose a dog",
      (dog) => `${dog.name} · ${dog.breed || "Unknown breed"}`,
    );
    fillSelect(
      $("#task-assigned-to"),
      state.trainers,
      "Choose a trainer",
      (trainer) => `${trainer.fullName} · ${trainer.email}`,
    );
  };

  const applyRolePermissions = () => {
    const newTaskButton = $("#new-task-btn");
    if (newTaskButton) {
      newTaskButton.disabled = !canCreateTask();
      newTaskButton.title = canCreateTask()
        ? ""
        : "Only administrators can create tasks.";
    }

    updateTaskFormPermissions();

    const locked = user.role !== "admin";
    document
      .querySelectorAll(
        "#dog-form input, #dog-form select, #dog-form textarea, #dog-submit-btn",
      )
      .forEach((element) => {
        element.disabled = locked;
      });

    document.querySelectorAll("#dogs-section .admin-note").forEach((note) => {
      if (locked) {
        note.classList.add("locked");
        note.textContent =
          "This account can browse data. Use an administrator account to create or update records.";
      }
    });
  };

  const setTaskFormOpen = (open) => {
    const listColumn = $("#task-list-column");
    const formColumn = $("#task-form-column");

    listColumn.className = open ? "col-12 col-xl-7" : "col-12";
    formColumn.classList.toggle("d-none", !open);
  };

  const taskFormModeTask = () => {
    const id = $("#task-form").elements.id.value;
    return id ? state.tasks.find((item) => idOf(item) === id) : null;
  };

  const updateTaskFormPermissions = (task = taskFormModeTask()) => {
    const form = $("#task-form");
    const isEditing = Boolean(task);
    const canSubmit = isEditing ? canManageTask(task) : canCreateTask();
    const note = $("#task-permission-note");

    document
      .querySelectorAll(
        "#task-form input, #task-form select, #task-form textarea, #task-submit-btn",
      )
      .forEach((element) => {
        element.disabled = !canSubmit;
      });

    if (isEditing) {
      note.textContent = canSubmit
        ? "Admins and assigned trainers can update this task."
        : "Only administrators and the assigned trainer can update this task.";
    } else {
      note.textContent = canSubmit
        ? "Create a new task and assign it to a trainer."
        : "Only administrators can create tasks. You can edit tasks assigned to you from the list.";
    }

    note.classList.toggle("locked", !canSubmit);
  };

  const resetTaskForm = () => {
    const form = $("#task-form");
    form.reset();
    form.classList.remove("was-validated");
    form.elements.id.value = "";
    $("#task-form-title").textContent = "Add task";
    $("#task-submit-btn").textContent = "Save task";
    updateTaskFormPermissions(null);
  };

  const openNewTaskForm = () => {
    resetTaskForm();
    setTaskFormOpen(true);
    $("#task-form").scrollIntoView({ behavior: "smooth", block: "start" });
    // Move keyboard and screen-reader focus to the first input in the form
    const firstInput = document.getElementById("task-title");
    if (firstInput) {
      firstInput.focus();
    }
  };

  const closeTaskForm = () => {
    resetTaskForm();
    setTaskFormOpen(false);
    // Return focus to the New Task button so keyboard users are not lost
    const newTaskBtn = document.getElementById("new-task-btn");
    if (newTaskBtn) newTaskBtn.focus();
  };

  const openDeleteTaskModal = (id) => {
    if (!canDeleteTask()) return;

    const task = state.tasks.find((item) => idOf(item) === id);
    if (!task) return;

    state.pendingDeleteTaskId = idOf(task);
    $("#delete-task-name").textContent = task.title || "this task";
    $("#delete-task-modal").classList.remove("d-none");
    document.body.classList.add("modal-open");
    $("#cancel-delete-task").focus();
  };

  const closeDeleteTaskModal = () => {
    state.pendingDeleteTaskId = "";
    $("#delete-task-modal").classList.add("d-none");
    document.body.classList.remove("modal-open");
    $("#confirm-delete-task").disabled = false;
    $("#cancel-delete-task").disabled = false;
  };

  const openDeleteDogModal = (id) => {
    if (!canDeleteDog()) return;

    const dog = state.dogs.find((item) => idOf(item) === id);
    if (!dog) return;

    state.pendingDeleteDogId = idOf(dog);
    $("#delete-dog-name").textContent = dog.name || "this dog";
    $("#delete-dog-modal").classList.remove("d-none");
    document.body.classList.add("modal-open");
    $("#cancel-delete-dog").focus();
  };

  const closeDeleteDogModal = () => {
    state.pendingDeleteDogId = "";
    $("#delete-dog-modal").classList.add("d-none");
    document.body.classList.remove("modal-open");
    $("#confirm-delete-dog").disabled = false;
    $("#cancel-delete-dog").disabled = false;
  };

  const deleteTask = async () => {
    const id = state.pendingDeleteTaskId;
    if (!id || !canDeleteTask()) return;

    $("#confirm-delete-task").disabled = true;
    $("#cancel-delete-task").disabled = true;

    try {
      await apiFetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if ($("#task-form").elements.id.value === id) {
        closeTaskForm();
      }

      closeDeleteTaskModal();
      await loadData();
      showMessage("Task deleted.", "success");
    } catch (error) {
      $("#confirm-delete-task").disabled = false;
      $("#cancel-delete-task").disabled = false;
      showMessage(error.message, "danger");
    }
  };

  const deleteDog = async () => {
    const id = state.pendingDeleteDogId;
    if (!id || !canDeleteDog()) return;

    $("#confirm-delete-dog").disabled = true;
    $("#cancel-delete-dog").disabled = true;

    try {
      await apiFetch(`/api/dogs/${id}`, {
        method: "DELETE",
      });

      if ($("#dog-form").elements.id.value === id) {
        resetDogForm();
      }

      closeDeleteDogModal();
      await loadData();
      showMessage("Dog profile deleted.", "success");
    } catch (error) {
      $("#confirm-delete-dog").disabled = false;
      $("#cancel-delete-dog").disabled = false;
      showMessage(error.message, "danger");
    }
  };

  const resetDogForm = () => {
    const form = $("#dog-form");
    form.reset();
    form.classList.remove("was-validated");
    form.elements.id.value = "";
    $("#dog-form-title").textContent = "Add dog";
    $("#dog-submit-btn").textContent = "Save profile";
  };

  const editTask = (id) => {
    const task = state.tasks.find((item) => idOf(item) === id);
    if (!task) return;

    const form = $("#task-form");
    form.elements.id.value = idOf(task);
    form.elements.title.value = task.title || "";
    form.elements.description.value = task.description || "";
    form.elements.dog.value = idOf(task.dog);
    form.elements.assignedTo.value = idOf(task.assignedTo);
    form.elements.priority.value = task.priority || "medium";
    form.elements.status.value = task.status || "pending";
    form.elements.dueDate.value = toDateInputValue(task.dueDate);
    form.classList.remove("was-validated");
    $("#task-form-title").textContent = "Edit task";
    $("#task-submit-btn").textContent = "Update task";
    updateTaskFormPermissions(task);
    setTaskFormOpen(true);
    setSection("tasks");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    // Move focus to the task title so screen readers announce the form
    const firstInput = document.getElementById("task-title");
    if (firstInput) {
      firstInput.focus();
    }
  };

  const editDog = (id) => {
    const dog = state.dogs.find((item) => idOf(item) === id);
    if (!dog) return;

    const form = $("#dog-form");
    form.elements.id.value = idOf(dog);
    form.elements.name.value = dog.name || "";
    form.elements.breed.value = dog.breed || "";
    form.elements.age.value = dog.age ?? "";
    form.elements.owner.value = dog.owner || "";
    form.elements.photo.value = dog.photo || "";
    form.elements.notes.value = dog.notes || "";
    form.classList.remove("was-validated");
    $("#dog-form-title").textContent = "Edit dog";
    $("#dog-submit-btn").textContent = "Update profile";
    setSection("dogs");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    const dogFormTitle = document.getElementById("dog-form-title");
    if (dogFormTitle) {
      dogFormTitle.focus();
    }
  };

  const renderAll = () => {
    renderStats();
    renderTasks();
    renderDogs();
    renderSelects();
    applyRolePermissions();
  };

  const loadData = async () => {
    clearMessage();
    try {
      const [tasks, dogs, trainers] = await Promise.all([
        apiFetch("/api/tasks"),
        apiFetch("/api/dogs"),
        apiFetch("/api/auth/trainers"),
      ]);
      state.tasks = tasks;
      state.dogs = dogs;
      state.trainers = trainers;
      renderAll();
      showMessage("Data refreshed.", "success");
    } catch (error) {
      showMessage(error.message, "danger");
    }
  };

  const taskPayloadFromForm = (form, includeCreatedBy) => {
    const formData = new FormData(form);
    const payload = {
      title: String(formData.get("title")).trim(),
      description: String(formData.get("description")).trim(),
      dog: String(formData.get("dog")),
      assignedTo: String(formData.get("assignedTo")),
      priority: String(formData.get("priority")),
      status: String(formData.get("status")),
    };

    if (includeCreatedBy) payload.createdBy = currentUserId();

    const dueDate = String(formData.get("dueDate"));
    if (dueDate) payload.dueDate = dueDate;
    if (payload.status === "completed")
      payload.completedAt = new Date().toISOString();

    return payload;
  };

  const dogPayloadFromForm = (form) => {
    const formData = new FormData(form);
    return {
      name: String(formData.get("name")).trim(),
      breed: String(formData.get("breed")).trim(),
      age: Number(formData.get("age")),
      owner: String(formData.get("owner")).trim(),
      photo: String(formData.get("photo")).trim(),
      notes: String(formData.get("notes")).trim(),
      addedBy: user.id,
    };
  };

  const setSection = (section) => {
    state.activeSection = section;
    const title = {
      overview: "Overview",
      tasks: "Tasks",
      dogs: "Dogs",
    }[section];

    $("#page-title").textContent = title;
    document.querySelectorAll(".side-link").forEach((button) => {
      const isActive = button.dataset.section === section;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      if (button.tagName && button.tagName.toLowerCase() === "a") {
        if (isActive) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
      }
    });
    document.querySelectorAll(".content-section").forEach((content) => {
      content.classList.add("d-none");
    });
    $(`#${section}-section`).classList.remove("d-none");

    if (section === "dogs") {
      const dogsSectionTitle = document.getElementById("dogs-section-title");
      if (dogsSectionTitle) {
        dogsSectionTitle.focus();
      }
    }
  };

  document.addEventListener("click", (event) => {
    const navButton = event.target.closest("[data-section]");
    if (navButton) {
      setSection(navButton.dataset.section);
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    if (actionButton.dataset.action === "new-task") {
      openNewTaskForm();
    }

    if (actionButton.dataset.action === "edit-task") {
      editTask(actionButton.dataset.id);
    }

    if (actionButton.dataset.action === "delete-task") {
      openDeleteTaskModal(actionButton.dataset.id);
    }

    if (actionButton.dataset.action === "edit-dog") {
      editDog(actionButton.dataset.id);
    }

    if (actionButton.dataset.action === "delete-dog") {
      openDeleteDogModal(actionButton.dataset.id);
    }
  });

  $("#logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
    window.location.href = "/login";
  });

  $("#refresh-btn").addEventListener("click", loadData);
  $("#new-task-btn").addEventListener("click", openNewTaskForm);
  $("#reset-task-form").addEventListener("click", resetTaskForm);
  $("#close-task-form").addEventListener("click", closeTaskForm);
  $("#cancel-delete-task").addEventListener("click", closeDeleteTaskModal);
  $("#confirm-delete-task").addEventListener("click", deleteTask);
  $("#delete-task-modal").addEventListener("click", (event) => {
    if (event.target.id === "delete-task-modal") {
      closeDeleteTaskModal();
    }
  });
  $("#cancel-delete-dog").addEventListener("click", closeDeleteDogModal);
  $("#confirm-delete-dog").addEventListener("click", deleteDog);
  $("#delete-dog-modal").addEventListener("click", (event) => {
    if (event.target.id === "delete-dog-modal") {
      closeDeleteDogModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      !$("#delete-task-modal").classList.contains("d-none")
    ) {
      closeDeleteTaskModal();
    }
    if (
      event.key === "Escape" &&
      !$("#delete-dog-modal").classList.contains("d-none")
    ) {
      closeDeleteDogModal();
    }
  });
  $("#reset-dog-form").addEventListener("click", resetDogForm);

  $("#task-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    form.classList.add("was-validated");

    if (!form.checkValidity()) {
      showMessage("Please check the highlighted task fields.", "warning");
      return;
    }

    const id = form.elements.id.value;
    const payload = taskPayloadFromForm(form, !id);

    try {
      if (id) {
        await apiFetch(`/api/tasks/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        showMessage("Task updated.", "success");
      } else {
        await apiFetch("/api/tasks/create", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showMessage("Task added.", "success");
      }

      closeTaskForm();
      await loadData();
    } catch (error) {
      showMessage(error.message, "danger");
    }
  });

  $("#dog-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    form.classList.add("was-validated");

    if (!form.checkValidity()) {
      showMessage("Please check the highlighted dog fields.", "warning");
      return;
    }

    const id = form.elements.id.value;
    const payload = dogPayloadFromForm(form);

    try {
      if (id) {
        await apiFetch(`/api/dogs/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        showMessage("Dog profile updated.", "success");
      } else {
        await apiFetch("/api/dogs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showMessage("Dog profile added.", "success");
      }

      resetDogForm();
      await loadData();
    } catch (error) {
      showMessage(error.message, "danger");
    }
  });

  renderUser();
  applyRolePermissions();
  // Ensure ARIA and active states are applied on initial load
  setSection(state.activeSection);
  loadData();
})();
