const manifest = browser.runtime.getManifest();
const isMacOS = window.navigator.userAgentData
    ? window.navigator.userAgentData.platform === 'macOS'
    : /Mac/i.test(window.navigator.userAgent);

const setAttr = function(attr) {
    if (!manifest[attr]) throw new Error(`manifest attribute ${attr} not set!`);

    const $attr = document.getElementById('tte-' + attr);
    if (!$attr) throw new Error(`element #tte-${attr} not found!`);

    $attr.innerHTML = manifest[attr];
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('load');
    setAttr('version');
    setAttr('name');

    if (!isMacOS) return;

    document.getElementById('modifier').innerHTML = '&#8984;';
})
