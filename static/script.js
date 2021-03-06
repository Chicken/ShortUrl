/* globals document fetch */
let customUrlInput = document.getElementById("customUrl");
let passwordInput = document.getElementById("password");
let submitButton = document.getElementById("submit");
let customCheck = document.getElementById("custom");
let outputField = document.getElementById("output");
let customForm = document.getElementById("customForm");
let forceCheck = document.getElementById("force");
let urlInput = document.getElementById("url");

customCheck.checked = false;
forceCheck.checked = false;
urlInput.value = "";
passwordInput.value = "";
customUrlInput.value = "";

urlInput.addEventListener("keypress", e => {
    if(e.key == "Enter") submitButton.click();
});

submitButton.addEventListener("click", async () => {
    let url = urlInput.value;
    if (url == "") {
        outputField.innerHTML = "No URL provided!";
        return;
    }
    let response;
    if(customCheck.checked) {
        response = await fetch("/new", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ custom: true, url, password: passwordInput.value, customUrl: customUrlInput.value, force: forceCheck.checked })
        });
    } else {
        response = await fetch("/new", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url, force: forceCheck.checked })
        });
    }
    let { status, url: short } = await response.json();
    let created = false;
    switch(status) {
    case 500:
        outputField.innerHTML = "Internal server error occured!";
        break;
    case 429:
        outputField.innerHTML = "You are being ratelimited!<br>Please wait a moment.";
        break;
    case 409:
        outputField.innerHTML = "Short url already exists!<br>Use the force option to bypass.";
        break;
    case 401:
        outputField.innerHTML = "Invalid password!";
        passwordInput.value = "";
        break;
    case 400:
        outputField.innerHTML = "Invalid URL provided!";
        break;
    case 201:
        created = true;
    case 200:
        outputField.innerHTML = `
        ${created ? "Here's your short url!" : "Found an existing short url!"} <br>
        Click to copy:
        <div class="tooltipContainer" onmouseout="resetTooltip()">
            <span class="copy" onclick="copy('${short}')">
                <span id="tooltip">Click to copy</span>
                ${short}
            </span>
        </div>
        `;
        urlInput.value = "";
        passwordInput.value = "";
        customUrlInput.value = "";
        break;
    }
});

customCheck.addEventListener("click", () => {
    if(customCheck.checked) customForm.classList.remove("hidden");
    else customForm.classList.add("hidden");
});

// eslint-disable-next-line no-unused-vars
const copy = str => {
    let tooltip = document.getElementById("tooltip");
    tooltip.innerHTML = "Copied!";
    let el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
};

// eslint-disable-next-line no-unused-vars
let resetTooltip = () => {
    let tooltip = document.getElementById("tooltip");
    tooltip.innerHTML = "Click to copy";
};
