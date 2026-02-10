const domainInput = document.getElementById("domain");
const startInput = document.getElementById("start");
const endInput = document.getElementById("end");
const addBtn = document.getElementById("add");
const saveBtn = document.getElementById("save");
const windowsList = document.getElementById("windows");
const savedList = document.getElementById("saved");

let windows = [];

function renderWindows() {
  windowsList.innerHTML = "";
  windows.forEach((w, i) => {
    const li = document.createElement("li");
    li.textContent = `${w.start} → ${w.end}`;
    windowsList.appendChild(li);
  });
}

addBtn.onclick = () => {
  if (!startInput.value || !endInput.value) return;

  windows.push({
    start: startInput.value,
    end: endInput.value
  });

  renderWindows();
};

saveBtn.onclick = () => {
  const domain = domainInput.value.trim();
  if (!domain || windows.length === 0) return;

  chrome.storage.sync.set({
    [domain]: windows
  }, () => {
    windows = [];
    renderWindows();
    loadSaved();
  });
};

function loadSaved() {
  chrome.storage.sync.get(null, (data) => {
    savedList.innerHTML = "";
    for (const domain in data) {
      const li = document.createElement("li");
      const ranges = data[domain]
        .map(w => `${w.start}-${w.end}`)
        .join(", ");
      li.textContent = `${domain}: ${ranges}`;
      savedList.appendChild(li);
    }
  });
}

loadSaved();
