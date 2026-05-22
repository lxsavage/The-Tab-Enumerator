function jsonifyForm(id) {
    const $formInputs = document.querySelectorAll(`form#${id} input:not([type='submit'])`);

    const result = {};
    for (const $input of $formInputs) {
        if (!$input.name) continue;

        switch ($input.type) {
            case 'checkbox':
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
        console.error('failed to load preexisting settings from sync store: ', ex);
        return;
    }

    try {
        const $formInputs = document.querySelectorAll("form#settings-form input:not([type='submit'])");
        for (const $input of $formInputs) {
            if (!($input.name in settings)) continue;

            if ($input.type === 'checkbox') {
                $input.checked = settings[$input.name];
            } else {
                $input.value = settings[$input.name];
            }
        }
    } catch (ex) {
        console.error('failed to apply preexisting settings from sync store: ', ex);
    }
}

async function syncSettingsAsync() {
    const form = jsonifyForm('settings-form');
    
    try {
        await chrome.storage.sync.set(form);
        console.debug('wrote settings to sync store');
    } catch (ex) {
        console.error('failed to write settings to sync store: ', ex);
    }
}

loadSettingsAsync().then(() => {
    const $form = document.getElementById('settings-form');
    $form.addEventListener('submit', async evt => {
        evt.preventDefault();
        await syncSettingsAsync();
        await loadSettingsAsync();
        alert('Settings saved.');
        return false;
    });
    $form.removeAttribute('hidden');

    document.getElementById('settings-form-load')
        .setAttribute('hidden', 'hidden');
});
