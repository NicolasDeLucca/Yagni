import logger from '../../logging/src/logger';
import fs from 'fs';
import dotenv from 'dotenv';
import forge from 'node-forge';

dotenv.config();

const KEY_NAME = 'refrigerator-service-key';
const CERT_NAME = 'refrigerator-service-cert';

const caKeyPem = fs.readFileSync('../security/ca-key.pem', 'utf8');
const caCertPem = fs.readFileSync('../security/ca-cert.pem', 'utf8');

const caKey = forge.pki.privateKeyFromPem(caKeyPem);
const caCert = forge.pki.certificateFromPem(caCertPem);

// Generar par de claves para el servicio de refrigerador
const refriServiceKeyPair = forge.pki.rsa.generateKeyPair(2048);

// Crear la solicitud de firma de certificado (CSR)
const refriServiceCSR = forge.pki.createCertificationRequest();
refriServiceCSR.publicKey = refriServiceKeyPair.publicKey;
refriServiceCSR.setSubject([
  { name: 'commonName', value: 'refrigerator-service.local' },
  { name: 'countryName', value: 'UY' },
  { name: 'organizationName', value: 'Refrigerator Service Org' }
]);
refriServiceCSR.sign(refriServiceKeyPair.privateKey, forge.md.sha256.create());

// Crear y firmar el certificado con la clave privada de la CA
const refriServiceCert = forge.pki.createCertificate();
refriServiceCert.publicKey = refriServiceKeyPair.publicKey;
refriServiceCert.serialNumber = '05';
refriServiceCert.validity.notBefore = new Date();
refriServiceCert.validity.notAfter = new Date();
refriServiceCert.validity.notAfter.setFullYear(refriServiceCert.validity.notBefore.getFullYear() + 5);
refriServiceCert.setSubject(refriServiceCSR.subject.attributes);
refriServiceCert.setIssuer(caCert.subject.attributes);
refriServiceCert.setExtensions([
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

refriServiceCert.sign(caKey, forge.md.sha256.create());

fs.writeFileSync(`${KEY_NAME}.pem`, forge.pki.privateKeyToPem(refriServiceKeyPair.privateKey));
fs.writeFileSync(`${CERT_NAME}.pem`, forge.pki.certificateToPem(refriServiceCert));

console.log("Refrigerator Service certificate created and signed by the CA.");
logger.info("Refrigerator Service certificate created and signed by the CA.");

process.exit(0);
