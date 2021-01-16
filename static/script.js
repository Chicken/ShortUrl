/* globals document fetch */
let customCheck = document.getElementById("custom");
let urlInput = document.getElementById("url");
let passwordInput = document.getElementById("password");
let customUrlInput = document.getElementById("customUrl");
let submitButton = document.getElementById("submit");
let outputField = document.getElementById("output");
let customForm = document.getElementById("customForm");

customCheck.checked = false;
urlInput.value = "";
passwordInput.value = "";
customUrlInput.value = "";

urlInput.addEventListener("keypress", e => {
    if(e.key == "Enter") submitButton.click();
})

submitButton.addEventListener("click", async () => {
    let url = urlInput.value;
    urlInput.value = "";
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
            body: JSON.stringify({ custom: true, url, password: passwordInput.value, customUrl: customUrlInput.value})
        });
        passwordInput.value = "";
        customUrlInput.value = "";
    } else {
        response = await fetch("/new", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url })
        });
    }
    let { status, url: short } = await response.json();
    switch(status) {
    case 500:
        outputField.innerHTML = "Internal server error occured!";
        break;
    case 401:
        outputField.innerHTML = "Invalid password!";
        break;
    case 400:
        outputField.innerHTML = "Invalid URL provided!";
        break;
    case 201:
        outputField.innerHTML = `Created a new short url!<br>Click to copy: <button class="copy" title="Copy to clipboard" onclick="copy('${short}')">${short}</button>`;
        break;
    case 200:
        outputField.innerHTML = `Found an existing short url!<br>Click to copy: <button class="copy" title="Copy to clipboard" onclick="copy('${short}')">${short}</button>`;
        break;
    }
});

customCheck.addEventListener("click", () => {
    if(customCheck.checked) customForm.classList.remove("hidden");
    else customForm.classList.add("hidden");
})

const copy = str => {
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
