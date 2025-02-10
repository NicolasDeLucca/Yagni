import logger from '../../logging/src/logger';
import fs from 'fs';
import dotenv from 'dotenv';
import forge from 'node-forge';

dotenv.config();

const KEY_NAME = 'refrigerator-app-key';
const CERT_NAME = 'refrigerator-app-cert';

const caKeyPem = fs.readFileSync('../security/ca-key.pem', 'utf8');
const caCertPem = fs.readFileSync('../security/ca-cert.pem', 'utf8');

const caKey = forge.pki.privateKeyFromPem(caKeyPem);
const caCert = forge.pki.certificateFromPem(caCertPem);

// Generar par de claves para la aplicación de refrigerador
const refriAppKeyPair = forge.pki.rsa.generateKeyPair(2048);

// Crear la solicitud de firma de certificado (CSR)
const refriAppCSR = forge.pki.createCertificationRequest();
refriAppCSR.publicKey = refriAppKeyPair.publicKey;
refriAppCSR.setSubject([
  { name: 'commonName', value: 'refrigerator-app.local' },
  { name: 'countryName', value: 'UY' },
  { name: 'organizationName', value: 'Refrigerator App Org' }
]);
refriAppCSR.sign(refriAppKeyPair.privateKey, forge.md.sha256.create());

// Crear y firmar el certificado con la clave privada de la CA
const refriAppCert = forge.pki.createCertificate();
refriAppCert.publicKey = refriAppKeyPair.publicKey;
refriAppCert.serialNumber = '04';
refriAppCert.validity.notBefore = new Date();
refriAppCert.validity.notAfter = new Date();
refriAppCert.validity.notAfter.setFullYear(refriAppCert.validity.notBefore.getFullYear() + 5);
refriAppCert.setSubject(refriAppCSR.subject.attributes);
refriAppCert.setIssuer(caCert.subject.attributes);
refriAppCert.setExtensions([
  {
    name: 'basicConstraints',
    cA: false
  },
  {
    name: 'keyUsage',
    digitalSignature: true,
    keyEncipherment: true
  },
  {
    name: 'extKeyUsage',
    serverAuth: true
  }
]);

refriAppCert.sign(caKey, forge.md.sha256.create());

fs.writeFileSync(`${KEY_NAME}.pem`, forge.pki.privateKeyToPem(refriAppKeyPair.privateKey));
fs.writeFileSync(`${CERT_NAME}.pem`, forge.pki.certificateToPem(refriAppCert));

console.log("Refrigerator App certificate created and signed by the CA.");
logger.info("Refrigerator App certificate created and signed by the CA.");

process.exit(0);
