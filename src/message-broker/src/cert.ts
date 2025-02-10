import fs from 'fs';
import logger from '../../logging/src/logger';
import forge from 'node-forge';

const KEY_NAME = 'message-broker-server-key';
const CERT_NAME = 'message-broker-server-cert';

const caKeyPem = fs.readFileSync('../security/ca-key.pem', 'utf8');
const caCertPem = fs.readFileSync('../security/ca-cert.pem', 'utf8');

const caKey = forge.pki.privateKeyFromPem(caKeyPem);
const caCert = forge.pki.certificateFromPem(caCertPem);

// Generar el par de claves del message-broker
const rabbitKeyPair = forge.pki.rsa.generateKeyPair(2048);

// Crear la solicitud de firma de certificado (CSR)
const rabbitCSR = forge.pki.createCertificationRequest();
rabbitCSR.publicKey = rabbitKeyPair.publicKey;
rabbitCSR.setSubject([
  { name: 'commonName', value: 'message-broker-server.local' },
  { name: 'countryName', value: 'UY' },
  { name: 'organizationName', value: 'Message Broker Org' }
]);
rabbitCSR.sign(rabbitKeyPair.privateKey, forge.md.sha256.create());

// Crear y firmar el certificado del message-broker con la CA
const rabbitCert = forge.pki.createCertificate();
rabbitCert.publicKey = rabbitKeyPair.publicKey;
rabbitCert.serialNumber = '02';
rabbitCert.validity.notBefore = new Date();
rabbitCert.validity.notAfter = new Date();
rabbitCert.validity.notAfter.setFullYear(rabbitCert.validity.notBefore.getFullYear() + 5);
rabbitCert.setSubject(rabbitCSR.subject.attributes);
rabbitCert.setIssuer(caCert.subject.attributes);
rabbitCert.setExtensions([
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

rabbitCert.sign(caKey, forge.md.sha256.create());

fs.writeFileSync(`${KEY_NAME}.pem`, forge.pki.privateKeyToPem(rabbitKeyPair.privateKey));
fs.writeFileSync(`${CERT_NAME}.pem`, forge.pki.certificateToPem(rabbitCert));

console.log("Message Broker certificate created and signed by the CA.");
logger.info("Message Broker certificate created and signed by the CA.");

process.exit(0);
