(() => {
const init = () => {
  if (document.querySelector('#de-main')) return;

  document.body.addEventListener('keypress', (e) => {
    const el = e.target;
    if (!(el.name === 'captcha' && el.type === 'text')) {
      return;
    }
    /*
    copypasta from
    https://github.com/SthephanShinkufag/Dollchan-Extension-Tools/blob/master/src/Dollchan_Extension_Tools.es6.user.js
    */
    const ruUa = 'йцукенгшщзхъїфыівапролджэєячсмитьбюёґ',
      en = 'qwertyuiop[]]assdfghjkl;\'\'zxcvbnm,.`\\';
    let i, code = e.charCode || e.keyCode,
      chr = String.fromCharCode(code).toLowerCase();
    if(code < 0x0410 || code > 0x04FF || (i = ruUa.indexOf(chr)) === -1) {
      return;
    }
    chr = en[i];
    const txt = chr;
    const scrtop = el.scrollTop;
    const start = el.selectionStart;
    el.value = el.value.substr(0, start) + txt + el.value.substr(el.selectionEnd);
    el.setSelectionRange(start + txt.length, start + txt.length);
    el.focus();
    el.scrollTop = scrtop;
    e.preventDefault();
  });
};

if (document.body) {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}

})();