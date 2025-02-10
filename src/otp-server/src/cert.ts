import fs from 'fs';
import logger from '../../logging/src/logger';
import forge from 'node-forge';
import dotenv from 'dotenv';

dotenv.config();

const KEY_NAME = process.env.KEY_NAME || 'otp-server-key';
const CERT_NAME = process.env.CERT_NAME || 'otp-server-cert';

const caKeyPem = fs.readFileSync('../security/ca-key.pem', 'utf8');
const caCertPem = fs.readFileSync('../security/ca-cert.pem', 'utf8');

const caKey = forge.pki.privateKeyFromPem(caKeyPem);
const caCert = forge.pki.certificateFromPem(caCertPem);

// Generar el par de claves del OTP server
const otpKeyPair = forge.pki.rsa.generateKeyPair(2048);

// Crear la solicitud de firma de certificado (CSR)
const otpCSR = forge.pki.createCertificationRequest();
otpCSR.publicKey = otpKeyPair.publicKey;
otpCSR.setSubject([
  { name: 'commonName', value: 'otp-server.local' },
  { name: 'countryName', value: 'UY' },
  { name: 'organizationName', value: 'OTP Server Org' }
]);
otpCSR.sign(otpKeyPair.privateKey, forge.md.sha256.create());

// Crear y firmar el certificado del OTP server con la CA
const otpCert = forge.pki.createCertificate();
otpCert.publicKey = otpKeyPair.publicKey;
otpCert.serialNumber = '03';
otpCert.validity.notBefore = new Date();
otpCert.validity.notAfter = new Date();
otpCert.validity.notAfter.setFullYear(otpCert.validity.notBefore.getFullYear() + 5);
otpCert.setSubject(otpCSR.subject.attributes);
otpCert.setIssuer(caCert.subject.attributes);
otpCert.setExtensions([
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

otpCert.sign(caKey, forge.md.sha256.create());

fs.writeFileSync(`${KEY_NAME}.pem`, forge.pki.privateKeyToPem(otpKeyPair.privateKey));
fs.writeFileSync(`${CERT_NAME}.pem`, forge.pki.certificateToPem(otpCert));

console.log("OTP Server certificate created and signed by the CA.");
logger.info("OTP Server certificate created and signed by the CA.");

process.exit(0);
