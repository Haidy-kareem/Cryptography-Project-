## CryptoKit — Cryptography Toolkit

An interactive, browser-based toolkit that demonstrates core cryptography 
concepts: symmetric encryption, asymmetric (RSA) encryption, encoding, 
and hashing. Built as a hands-on cryptography assignment.

### Features
- **Symmetric Encryption**: AES, DES, and 3DES with multiple modes 
  (ECB, CBC, CFB, OFB, CTR) and key/IV generation
- **Asymmetric Encryption (RSA)**: key pair generation (512/1024/2048-bit), 
  encrypt with public key, decrypt with private key
- **Encoding**: Base64, Hexadecimal, and URL encoding/decoding
- **Hashing**: SHA-256, SHA-512, and MD5, with optional salt

Each section includes short explanations of the underlying concept 
(e.g. why ECB leaks patterns, why hashing is one-way) for educational purposes.

### Tech stack
HTML, CSS, JavaScript — CryptoJS for symmetric encryption, 
Web Crypto API (SubtleCrypto) for RSA
