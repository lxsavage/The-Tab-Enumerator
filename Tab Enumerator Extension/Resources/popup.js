const isMacOS = window.navigator.userAgentData
    ? window.navigator.userAgentData.platform === 'macOS'
    : /Mac/i.test(window.navigator.userAgent);

const manifest = browser.runtime.getManifest();

function setAttr(attr) {
    if (!manifest[attr]) throw new Error(`manifest attribute ${attr} not set!`);

    const $attr = document.getElementById('tte-' + attr);
    if (!$attr) throw new Error(`element #tte-${attr} not found!`);

    $attr.innerHTML = manifest[attr];
}

document.addEventListener('DOMContentLoaded', () => {
    setAttr('version');
    setAttr('name');

    if (!isMacOS) return;

    // SHIM: MacOS has the tab jump shortcut modifier as meta instead of ctrl
    document.getElementById('modifier').innerHTML = '&#8984;'; // CMD symbol
})
