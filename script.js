/* ─── LANDING / NAVIGATION ─── */
const sectionLabels = {
  symmetric: 'Symmetric Encryption',
  asymmetric: 'Asymmetric (RSA)',
  encoding: 'Encoding / Decoding',
  hashing: 'Hashing'
};

function openSection(name) {
  const landing = document.getElementById('landing');
  const contentArea = document.getElementById('content-area');

  landing.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
  landing.style.opacity = '0';
  landing.style.transform = 'scale(0.97)';

  setTimeout(() => {
    landing.style.display = 'none';
    document.querySelector('.tabs').style.display = 'none';
    const backLabel = document.getElementById('back-section-label');
    if (backLabel) backLabel.textContent = sectionLabels[name] || name;
    contentArea.style.display = 'block';
    void contentArea.offsetWidth;
    contentArea.style.animation = 'contentReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) both';
    switchTab(name, document.getElementById('tab-btn-' + name));
  }, 350);
}

function goHome() {
  const landing = document.getElementById('landing');
  const contentArea = document.getElementById('content-area');

  contentArea.style.transition = 'opacity 0.3s ease';
  contentArea.style.opacity = '0';

  setTimeout(() => {
    contentArea.style.display = 'none';
    contentArea.style.opacity = '';
    contentArea.style.transition = '';
    // Reset tabs to visible for next openSection call
    document.querySelector('.tabs').style.display = '';

    landing.style.display = 'flex';
    landing.style.opacity = '0';
    landing.style.transform = 'scale(0.97)';
    void landing.offsetWidth;
    landing.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    landing.style.opacity = '1';
    landing.style.transform = 'scale(1)';
  }, 300);
}

/* ─── TAB SWITCHING ─── */
function switchTab(name, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
}

/* ─── HELPERS ─── */
function showAlert(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = 'alert ' + type + ' show';
  setTimeout(() => el.classList.remove('show'), 4000);
}

function setOutput(boxId, textId, value) {
  const box = document.getElementById(boxId);
  const txt = document.getElementById(textId);
  const empty = box.querySelector('.empty-msg');
  if (empty) empty.style.display = 'none';
  txt.textContent = value;
  txt.style.color = 'var(--green)';
}

function copyText(id) {
  const val = document.getElementById(id).textContent;
  if (!val) return;
  const toast = document.getElementById('copy-toast');
  const showToast = () => {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  };
  navigator.clipboard.writeText(val).then(showToast).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = val; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
    showToast();
  });
}

function hexStr(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
}
function randomBytes(n) {
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  return arr;
}

/* ─── MODE / ALGO CHANGE ─── */
function onModeChange() {
  const mode = document.getElementById('sym-mode').value;
  document.getElementById('ecb-warning').style.display = mode === 'ECB' ? 'flex' : 'none';
}

function onAlgoChange() {
  const algo = document.getElementById('sym-algo').value;
  const ksLabel = document.getElementById('aes-keysize-label');
  const ks = document.getElementById('sym-keysize');
  const desNote = document.getElementById('des-key-note');

  if (algo === 'AES') {
    ksLabel.textContent = '(AES: 128/192/256 bit)';
    ks.innerHTML = `<option value="128">128-bit</option><option value="192">192-bit</option><option value="256" selected>256-bit</option>`;
    desNote.style.display = 'none';
  } else if (algo === 'DES') {
    ksLabel.textContent = '(DES: always 64-bit / 56 effective)';
    ks.innerHTML = `<option value="64" selected>64-bit</option>`;
    desNote.style.display = 'block';
  } else {
    ksLabel.textContent = '(3DES: 128-bit or 192-bit)';
    ks.innerHTML = `<option value="128">128-bit (2-key)</option><option value="192" selected>192-bit (3-key)</option>`;
    desNote.style.display = 'none';
  }
}

function generateSymKey() {
  const algo = document.getElementById('sym-algo').value;
  const ks = parseInt(document.getElementById('sym-keysize').value);
  const bytes = ks / 8;
  document.getElementById('sym-key').value = hexStr(randomBytes(bytes));
}

function generateIV() {
  const algo = document.getElementById('sym-algo').value;
  const bytes = (algo === 'DES' || algo === '3DES') ? 8 : 16;
  document.getElementById('sym-iv').value = hexStr(randomBytes(bytes));
}

function getSymCipher() {
  const algo = document.getElementById('sym-algo').value;
  const mode = document.getElementById('sym-mode').value;
  const keyHex = document.getElementById('sym-key').value.trim();
  const ivHex = document.getElementById('sym-iv').value.trim();

  if (!keyHex) throw new Error('Please enter or generate a secret key.');

  const expectedKeyBytes = { 'AES': [16, 24, 32], 'DES': [8], '3DES': [16, 24] };
  const keyBytes = keyHex.length / 2;
  if (keyHex.length % 2 !== 0 || !expectedKeyBytes[algo].includes(keyBytes)) {
    throw new Error(`Invalid key length for ${algo}. Expected ${expectedKeyBytes[algo].map(b => b*8).join('/')} bits (got ${keyBytes*8} bits).`);
  }

  if (mode !== 'ECB') {
    if (!ivHex) throw new Error('IV is required for ' + mode + ' mode. Please enter or generate an IV.');
    const ivBytes = ivHex.length / 2;
    const expectedIV = (algo === 'AES') ? 16 : 8;
    if (ivBytes !== expectedIV) throw new Error(`IV must be ${expectedIV * 8} bits (${expectedIV} bytes) for ${algo}.`);
  }

  const key = CryptoJS.enc.Hex.parse(keyHex);
  const iv = ivHex ? CryptoJS.enc.Hex.parse(ivHex) : null;

  let modeObj, paddingObj = CryptoJS.pad.Pkcs7;
  switch(mode) {
    case 'CBC': modeObj = CryptoJS.mode.CBC; break;
    case 'ECB': modeObj = CryptoJS.mode.ECB; break;
    case 'CFB': modeObj = CryptoJS.mode.CFB; break;
    case 'OFB': modeObj = CryptoJS.mode.OFB; break;
    case 'CTR': modeObj = CryptoJS.mode.CTR; paddingObj = CryptoJS.pad.NoPadding; break;
  }

  let cfg = { mode: modeObj, padding: paddingObj };
  if (mode !== 'ECB' && iv) cfg.iv = iv;

  return { algo, key, cfg };
}

function symEncrypt() {
  try {
    const pt = document.getElementById('sym-plaintext').value;
    if (!pt) throw new Error('Please enter plaintext to encrypt.');
    const { algo, key, cfg } = getSymCipher();

    let encrypted;
    if (algo === 'AES') {
      encrypted = CryptoJS.AES.encrypt(pt, key, cfg);
    } else if (algo === 'DES') {
      encrypted = CryptoJS.DES.encrypt(pt, key, cfg);
    } else {
      encrypted = CryptoJS.TripleDES.encrypt(pt, key, cfg);
    }

    const result = encrypted.toString();
    setOutput('sym-enc-output', 'sym-enc-output-text', result);
    document.getElementById('sym-ciphertext').value = result;

    const ivHexUsed = document.getElementById('sym-iv').value.trim();
    const ivDisplay = document.getElementById('sym-enc-iv-display');
    if (ivHexUsed && document.getElementById('sym-mode').value !== 'ECB') {
      document.getElementById('sym-enc-iv-val').textContent = ivHexUsed;
      ivDisplay.style.display = 'block';
    } else {
      ivDisplay.style.display = 'none';
    }
    showAlert('sym-success', '✓ Encryption successful!', 'success');
  } catch(e) {
    showAlert('sym-error', '✗ ' + e.message, 'error');
  }
}

function symDecrypt() {
  try {
    const ct = document.getElementById('sym-ciphertext').value.trim();
    if (!ct) throw new Error('Please enter ciphertext to decrypt.');
    const { algo, key, cfg } = getSymCipher();

    let decrypted;
    if (algo === 'AES') {
      decrypted = CryptoJS.AES.decrypt(ct, key, cfg);
    } else if (algo === 'DES') {
      decrypted = CryptoJS.DES.decrypt(ct, key, cfg);
    } else {
      decrypted = CryptoJS.TripleDES.decrypt(ct, key, cfg);
    }

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    if (!result) throw new Error('Decryption failed. Check your key, IV, and algorithm.');
    setOutput('sym-dec-output', 'sym-dec-output-text', result);
    showAlert('sym-success', '✓ Decryption successful!', 'success');
  } catch(e) {
    showAlert('sym-error', '✗ ' + e.message, 'error');
  }
}

function clearSym() {
  ['sym-plaintext','sym-ciphertext','sym-key','sym-iv'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('sym-enc-output-text').textContent = '';
  document.getElementById('sym-dec-output-text').textContent = '';
  document.getElementById('sym-enc-iv-display').style.display = 'none';
  document.querySelectorAll('#sym-enc-output .empty-msg, #sym-dec-output .empty-msg').forEach(e => e.style.display = 'block');
}

/* ─── RSA ─── */
let rsaKeyPair = null;

async function generateRSAKeys() {
  const size = parseInt(document.getElementById('rsa-keysize').value);
  const statusEl = document.getElementById('rsa-key-status');
  statusEl.textContent = '⏳ Generating keys... (this may take a moment for 2048-bit)';
  statusEl.className = 'alert show';
  statusEl.style.background = 'rgba(245,158,11,0.1)';
  statusEl.style.borderColor = 'rgba(245,158,11,0.3)';
  statusEl.style.color = '#fde68a';

  try {
    rsaKeyPair = await window.crypto.subtle.generateKey(
      { name: 'RSA-OAEP', modulusLength: size, publicExponent: new Uint8Array([1,0,1]), hash: 'SHA-256' },
      true, ['encrypt','decrypt']
    );

    const pubExported = await window.crypto.subtle.exportKey('spki', rsaKeyPair.publicKey);
    const privExported = await window.crypto.subtle.exportKey('pkcs8', rsaKeyPair.privateKey);

    document.getElementById('rsa-pub-key').textContent = toPem(pubExported, 'PUBLIC KEY');
    document.getElementById('rsa-priv-key').textContent = toPem(privExported, 'PRIVATE KEY');

    statusEl.textContent = `✓ ${size}-bit RSA key pair generated successfully!`;
    statusEl.style.background = 'rgba(16,185,129,0.1)';
    statusEl.style.borderColor = 'rgba(16,185,129,0.3)';
    statusEl.style.color = '#6ee7b7';
    setTimeout(() => statusEl.classList.remove('show'), 4000);
  } catch(e) {
    statusEl.textContent = '✗ Key generation failed: ' + e.message;
    statusEl.style.background = 'rgba(239,68,68,0.1)';
    statusEl.style.borderColor = 'rgba(239,68,68,0.3)';
    statusEl.style.color = '#fca5a5';
  }
}

function toPem(buffer, label) {
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const lines = b64.match(/.{1,64}/g).join('\n');
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

async function rsaEncrypt() {
  try {
    if (!rsaKeyPair) throw new Error('Please generate RSA keys first.');
    const pt = document.getElementById('rsa-plaintext').value;
    if (!pt) throw new Error('Please enter plaintext to encrypt.');

    const size = parseInt(document.getElementById('rsa-keysize').value);
    const maxBytes = (size / 8) - 42;
    const ptBytes = new TextEncoder().encode(pt).length;
    if (ptBytes > maxBytes) {
      throw new Error(`Message too long for ${size}-bit RSA. Max is ${maxBytes} bytes (you have ${ptBytes}). Use a shorter message.`);
    }

    const encoded = new TextEncoder().encode(pt);
    const encrypted = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, rsaKeyPair.publicKey, encoded);
    const b64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

    setOutput('rsa-enc-output', 'rsa-enc-text', b64);
    document.getElementById('rsa-ciphertext').value = b64;
    showAlert('rsa-success', '✓ RSA Encryption successful!', 'success');
  } catch(e) {
    showAlert('rsa-error', '✗ ' + e.message, 'error');
  }
}

async function rsaDecrypt() {
  try {
    if (!rsaKeyPair) throw new Error('Please generate RSA keys first.');
    const ct = document.getElementById('rsa-ciphertext').value.trim();
    if (!ct) throw new Error('Please enter ciphertext to decrypt.');

    const bytes = Uint8Array.from(atob(ct), c => c.charCodeAt(0));
    const decrypted = await window.crypto.subtle.decrypt({ name: 'RSA-OAEP' }, rsaKeyPair.privateKey, bytes);
    const result = new TextDecoder().decode(decrypted);

    setOutput('rsa-dec-output', 'rsa-dec-text', result);
    showAlert('rsa-success', '✓ RSA Decryption successful!', 'success');
  } catch(e) {
    showAlert('rsa-error', '✗ ' + e.message, 'error');
  }
}

/* ─── ENCODING ─── */
function encodeText() {
  try {
    const input = document.getElementById('enc-input').value;
    if (!input) throw new Error('Please enter text to encode.');
    const type = document.getElementById('enc-type').value;
    let result;

    if (type === 'base64') {
      result = btoa(new TextEncoder().encode(input).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    } else if (type === 'hex') {
      result = Array.from(new TextEncoder().encode(input))
        .map(b => b.toString(16).padStart(2,'0')).join('');
    } else {
      result = encodeURIComponent(input);
    }

    setOutput('enc-output', 'enc-output-text', result);
  } catch(e) {
    showAlert('enc-error', '✗ ' + e.message, 'error');
  }
}

function decodeText() {
  try {
    const input = document.getElementById('enc-input').value.trim();
    if (!input) throw new Error('Please enter text to decode.');
    const type = document.getElementById('enc-type').value;
    let result;

    if (type === 'base64') {
      result = new TextDecoder().decode(Uint8Array.from(atob(input), c => c.charCodeAt(0)));
    } else if (type === 'hex') {
      if (input.length % 2 !== 0) throw new Error('Invalid hex string (odd length).');
      const bytes = input.match(/.{1,2}/g).map(b => parseInt(b, 16));
      result = new TextDecoder().decode(new Uint8Array(bytes));
    } else {
      result = decodeURIComponent(input);
    }

    setOutput('enc-output', 'enc-output-text', result);
  } catch(e) {
    showAlert('enc-error', '✗ Decode failed: ' + e.message, 'error');
  }
}

function clearEnc() {
  document.getElementById('enc-input').value = '';
  document.getElementById('enc-output-text').textContent = '';
}

/* ─── HASHING ─── */
function generateSalt() {
  document.getElementById('hash-salt').value = hexStr(randomBytes(16));
}

function computeHashes() {
  try {
    const input = document.getElementById('hash-input').value;
    if (!input) throw new Error('Please enter text to hash.');
    const salt = document.getElementById('hash-salt').value.trim();
    const saltedInput = salt ? (salt + input) : input;

    document.getElementById('hash-sha256').textContent = CryptoJS.SHA256(input).toString();
    document.getElementById('hash-sha512').textContent = CryptoJS.SHA512(input).toString();
    document.getElementById('hash-salted256').textContent = salt
      ? CryptoJS.SHA256(saltedInput).toString() + '  ← salt: ' + salt
      : '(no salt provided)';
    document.getElementById('hash-salted512').textContent = salt
      ? CryptoJS.SHA512(saltedInput).toString() + '  ← salt: ' + salt
      : '(no salt provided)';
    document.getElementById('hash-md5').textContent = CryptoJS.MD5(input).toString() + '  ⚠ INSECURE';

    document.getElementById('hash-results').style.display = 'grid';
  } catch(e) {
    showAlert('hash-error', '✗ ' + e.message, 'error');
  }
}

function clearHash() {
  document.getElementById('hash-input').value = '';
  document.getElementById('hash-salt').value = '';
  document.getElementById('hash-results').style.display = 'none';
}

/* ─── CLICK RIPPLE ─── */
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.btn');
  const navBtn = e.target.closest('.nav-btn');
  if (btn) {
    btn.classList.remove('ripple-active');
    void btn.offsetWidth;
    btn.classList.add('ripple-active');
    btn.addEventListener('animationend', () => btn.classList.remove('ripple-active'), { once: true });
  }
  if (navBtn) {
    navBtn.classList.remove('ripple-active');
    void navBtn.offsetWidth;
    navBtn.classList.add('ripple-active');
    navBtn.addEventListener('animationend', () => navBtn.classList.remove('ripple-active'), { once: true });
  }
});
