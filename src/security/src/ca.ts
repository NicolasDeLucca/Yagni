import fs from 'fs';
import logger from '../../logging/src/logger';

const forge = require('node-forge');
const CA_KEY_NAME = 'ca-key';
const CA_CERT_NAME = 'ca-cert';

const keyPair = forge.pki.rsa.generateKeyPair(2048);

// clave privada de la CA
const caKey = keyPair.privateKey;

// certificado de la CA
const caCert = forge.pki.createCertificate();
caCert.publicKey = keyPair.publicKey;
caCert.serialNumber = '01';
caCert.validity.notBefore = new Date();
caCert.validity.notAfter = new Date();
caCert.validity.notAfter.setFullYear(caCert.validity.notBefore.getFullYear() + 5);

caCert.setSubject([
  { name: 'commonName', value: 'My CA' },
  { name: 'countryName', value: 'UY' },
  { name: 'organizationName', value: 'Solid-Yagni' }
]);

caCert.setIssuer(caCert.subject);
caCert.setExtensions([
  {
    name: 'basicConstraints',
    cA: true
  },
  {
    name: 'keyUsage',
    keyCertSign: true,
    cRLSign: true
  }
]); 

caCert.sign(caKey, forge.md.sha256.create());

fs.writeFileSync(`${CA_KEY_NAME}.pem`, forge.pki.privateKeyToPem(caKey));
fs.writeFileSync(`${CA_CERT_NAME}.pem`, forge.pki.certificateToPem(caCert));

console.log("Security - CA created successfully!");
logger.info("Security - CA created successfully!");


