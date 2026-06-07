const isSafari =
    navigator.vendor &&
    navigator.vendor.indexOf("Apple") > -1 &&
    navigator.userAgent &&
    navigator.userAgent.indexOf("CriOS") == -1 &&
    navigator.userAgent.indexOf("FxiOS") == -1;

function jsonifyForm(id) {
    const $formInputs = document.querySelectorAll(
        `form#${id} input:not([type='submit'])`,
    );

    const result = {};
    for (const $input of $formInputs) {
        if (!$input.name) continue;

        switch ($input.type) {
            case "checkbox":
                result[$input.name] = $input.checked;
                break;
            default:
                result[$input.name] = $input.value;
                break;
        }
    }

    return result;
}

async function loadSettingsAsync() {
    let settings = {};
    try {
        settings = await chrome.storage.sync.get(null);
    } catch (ex) {
        console.error(
            "failed to load preexisting settings from sync store: ",
            ex,
        );
        return;
    }

    try {
        const $formInputs = document.querySelectorAll(
            "form#settings-form input:not([type='submit'])",
        );
        const $reset = document.getElementById("settings-form-reset");
        const $submit = document.querySelector(
            "form#settings-form input[type='submit']",
        );

        for (const $input of $formInputs) {
            $input.addEventListener("change", (_) => {
                $reset.removeAttribute("disabled");
                $submit.removeAttribute("disabled");
            });

            if (!($input.name in settings)) continue;

            if ($input.type === "checkbox") {
                $input.checked = settings[$input.name];
            } else {
                $input.value = settings[$input.name];
            }
        }
    } catch (ex) {
        console.error(
            "failed to apply preexisting settings from sync store: ",
            ex,
        );
    }
}

async function syncSettingsAsync() {
    const form = jsonifyForm("settings-form");

    try {
        await chrome.storage.sync.set(form);
        console.debug("wrote settings to sync store");
    } catch (ex) {
        console.error("failed to write settings to sync store: ", ex);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadSettingsAsync();

    const $form = document.getElementById("settings-form");
    const $reset = document.getElementById("settings-form-reset");
    const $submit = document.querySelector(
        '#settings-form input[type="submit"]',
    );

    $reset.addEventListener("click", async (_) => {
        await loadSettingsAsync();
        $reset.setAttribute("disabled", "disabled");
        $submit.setAttribute("disabled", "disabled");
    });

    $form.addEventListener("submit", async (evt) => {
        evt.preventDefault();
        await syncSettingsAsync();
        await loadSettingsAsync();
        alert("Settings saved.");

        $reset.setAttribute("disabled", "disabled");
        $submit.setAttribute("disabled", "disabled");
        return false;
    });

    document
        .getElementById("settings-form-load")
        .setAttribute("hidden", "hidden");

    $reset.setAttribute("disabled", "disabled");
    $submit.setAttribute("disabled", "disabled");

    if (isSafari) {
        for (const elem of document.getElementsByClassName("not-safari")) {
            elem.remove();
        }
        for (const elem of document.getElementsByClassName("safari-only")) {
            elem.removeAttribute("hidden");
        }
    } else {
        for (const elem of document.getElementsByClassName("safari-only")) {
            elem.remove();
        }
        for (const elem of document.getElementsByClassName("not-safari")) {
            elem.removeAttribute("hidden");
        }
    }

    $form.removeAttribute("hidden");
});
