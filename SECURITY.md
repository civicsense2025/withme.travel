# Security & Privacy Practices

> TL;DR: withme.travel enforces TLS 1.3 encryption in transit, AES-256 at rest, JWT-based sessions with HTTP-only cookies, OAuth2 and Supabase Auth flows, strict Row-Level Security (RLS) policies, and real-time monitoring (Sentry, CI vulnerability scans) for rapid threat detection.
>
> For a full technical deep dive, see the sections below.

This document outlines how withme.travel protects user data, maintains privacy, and secures our codebase and infrastructure—particularly leveraging Supabase and modern best practices.

---

## 1. Overview

- **Trust & Transparency**: We are committed to keeping your data safe and providing clear insights into our security measures.
- **Defense in Depth**: Multiple layers of security (network, application, data) to mitigate risk.
- **Continuous Improvement**: Regular audits, dependency updates, and policy reviews.

## 2. Data Handling & Privacy

- **Minimal Data Collection**: We only collect data required to deliver our service (e.g. authentication, profiles, trip information).
- **Data Encryption**:
  - **In Transit**: All traffic is encrypted using HTTPS/TLS.
  - **At Rest**: Supabase automatically encrypts all PostgreSQL data using AES-256.
- **Access Controls**:
  - Role-Based Access Control (RBAC) in Supabase ensures that users only see and modify resources they own or are invited to.
  - Row-Level Security (RLS) policies enforce data isolation at the database level.
- **Data Retention**: We retain personal data only as long as necessary; users can request data deletion at any time.

## 3. Authentication & Session Management

- **Supabase Auth**:
  - Uses secure hashing (bcrypt) for passwords.
  - Supports OAuth providers and magic links.
- **Session Tokens**:
  - Short-lived access tokens with automatic refresh flows.
  - Secure storage in HTTP-only cookies to prevent XSS access.
- **Brute Force Protection**: Supabase provides rate-limiting on auth endpoints; we also implement in-app rate limiting.

## 4. API & Codebase Security

- **API Protection**:
  - CSRF mitigations on form-based and state-changing endpoints.
  - Input validation & sanitization using Zod schemas to prevent injection attacks.
- **Secure Coding Practices**:
  - Strict TypeScript configuration (`strict`, `noImplicitAny`) to eliminate runtime type errors.
  - ESLint and Prettier enforce consistent style and catch potential issues early.
  - Dependency audits (`npm audit`, `depcheck`) run in CI to identify vulnerabilities.
- **Secrets & Environment Variables**:
  - All secrets (API keys, supabase URL/anon keys) stored in environment variables—never checked into version control.
  - We enforce dotenv schema validation to ensure required variables are present at build time.

## 5. Database Security (Supabase)

- **Row-Level Security (RLS)**:
  - Custom RLS policies ensure users can only access their own rows unless explicitly shared.
- **Database Backups**:
  - Supabase manages automated daily backups with point-in-time recovery.
- **Least Privilege**:
  - Client-side operations use restricted anon keys with only necessary permissions.
  - Server operations (migrations, admin tasks) use service_role keys with full rights—and are never exposed to clients.

## 6. Monitoring & Incident Response

- **Logging & Monitoring**:
  - Application errors and performance issues tracked via Sentry.
  - Database metrics and logs monitored via Supabase Dashboard.
- **Alerts & Response**:
  - Automated alerts on suspicious activity or threshold breaches.
  - Incident response playbooks ensure timely investigation and user notification.

## 7. Compliance & Best Practices

- **GDPR & CCPA**: Data privacy rights honored—users can export or delete their personal data.
- **Encryption Standards**: Adherence to industry standards (TLS 1.2+, AES-256).
- **Penetration Testing**: Periodic security assessments by third parties.

## 8. Incident Response & FAQ

**Q: How do we detect and respond to security incidents?**  
A: We leverage real-time monitoring (Sentry, anomaly detection) and automated alerts for suspicious activity. Our incident response team follows documented playbooks to triage, contain, and remediate issues within hours.

**Q: What happens if user data is compromised?**  
A: We isolate affected systems, revoke compromised credentials, apply emergency patches, and conduct a thorough forensics review. Impacted users are notified promptly and offered guidance to secure their accounts.

**Q: How will users be informed of a breach?**  
A: We send direct email notifications outlining the scope of the issue and recommended next steps. If regulatory requirements apply (GDPR/CCPA), we also notify relevant authorities and publish a public post-mortem on our status page.

**Q: How can users help protect their accounts?**  
A: We recommend choosing strong, unique passwords, enabling two-factor authentication where supported, and following any recovery steps we provide immediately upon notification.

## 9. Security Audit & Future Roadmap

### Current Safeguards

- TLS 1.3 encryption for all network traffic.
- AES-256 encryption at rest for database storage.
- JWT-based sessions stored in HTTP-only, Secure cookies.
- Supabase RLS and RBAC policies enforcing fine-grained data access.
- Zod schema validation and sanitization on all input.
- Automated dependency vulnerability scans (`npm audit`, `depcheck`).
- Real-time monitoring and error tracking via Sentry.
- Daily database backups with point-in-time recovery.
- Rate limiting on auth and API endpoints.

### Areas for Strengthening

- Implement optional multi-factor authentication (MFA) for user accounts.
- Introduce automated penetration testing and dynamic application security testing (DAST) in CI/CD.
- Add CI checks for RLS policy coverage and schema drift detection.
- Integrate a secrets management vault with scheduled credential rotation.
- Deploy a Web Application Firewall (WAF) for added edge-level protection.
- Expand audit logging for critical actions and retention policies.
- Conduct regular security training and tabletop exercises for the team.
- Harden deployment environments with container/image vulnerability scanning.
- Review and rotate Supabase service_role keys periodically.

---

For questions or to report a vulnerability, please contact our security team at [security@withme.travel](mailto:security@withme.travel).

## 10. Glossary of Security Terms

- **Access Control** - Mechanisms and policies that restrict access to resources to only authorized users.
- **Account Hijacking** - Unauthorized takeover of a user's account by compromising credentials.
- **Adversary** - An entity that poses a threat to system security or data integrity.
- **AES (Advanced Encryption Standard)** - A symmetric encryption algorithm standardized by NIST for secure data encryption.
- **Algorithm** - A well-defined computational procedure used for encryption, hashing, or other operations.
- **Anonymization** - Process of removing personally identifiable information from data sets.
- **Anti-Virus** - Software designed to detect, prevent, and remove malware from systems.
- **Application Security** - Practices and tools used to secure software applications from threats.
- **Audit Trail** - A chronological record of system activities for forensic analysis and compliance.
- **Authentication** - Verification of a user's or system's identity before granting access.
- **Authorization** - Granting or denying specific privileges to authenticated users.
- **Availability** - Ensuring reliable access to systems and data when needed.
- **Backup** - Copying data to a separate storage medium for recovery in case of loss.
- **Baseline** - Standardized configuration or benchmark used to measure system integrity.
- **BCP (Business Continuity Plan)** - Strategy for maintaining business operations during and after a disruptive event.
- **Biometrics** - Use of unique physical characteristics (fingerprint, iris) to verify identity.
- **Black Box Testing** - Security testing with no prior knowledge of internal system code or architecture.
- **Blacklist** - A list of known malicious items (IPs, files, URLs) blocked by security systems.
- **Block Cipher** - Encryption algorithm that processes fixed-size blocks of plaintext.
- **Botnet** - A network of compromised devices used to carry out coordinated attacks.
- **Brute Force Attack** - Attempting every possible key or password until the correct one is found.
- **CA (Certificate Authority)** - Trusted entity that issues digital certificates for identity verification.
- **CAPTCHA** - Challenge–response test used to distinguish humans from automated bots.
- **Cipher** - Algorithm for encryption and decryption of data.
- **CIA Triad** - Core principles of security: Confidentiality, Integrity, and Availability.
- **Code Injection** - Attack that supplies malicious code to be executed by the target application.
- **Compliance** - Conformance with legal, regulatory, and policy requirements.
- **Container Security** - Measures to isolate and protect containerized applications.
- **CSRF (Cross-Site Request Forgery)** - Attack that tricks a user's browser into executing unwanted actions.
- **Cryptography** - Practice of securing information via encryption and decryption techniques.
- **Cybersecurity** - Discipline focused on protecting systems, networks, and data from digital attacks.
- **Data Breach** - Unauthorized access and retrieval of sensitive information from a system.
- **Data Encryption** - Converting plaintext into ciphertext to protect data confidentiality.
- **Data Integrity** - Assurance that data is accurate, consistent, and has not been tampered with.
- **Data Loss Prevention (DLP)** - Tools and processes to prevent unauthorized data exfiltration.
- **Data Masking** - Obfuscating sensitive data elements to limit exposure.
- **Data Privacy** - Management of personal data to protect user confidentiality and comply with regulations.
- **DDoS (Distributed Denial of Service)** - Attack that overwhelms a service with traffic from multiple sources.
- **DevSecOps** - Integrating security processes and tools into DevOps workflows.
- **Digital Certificate** - Electronic credential binding a public key to an entity's identity.
- **Digital Signature** - Cryptographic mechanism to verify data origin and integrity.
- **Directory Traversal** - Attack that accesses files and directories outside the intended scope.
- **DNS Spoofing** - Manipulating DNS records to redirect traffic to malicious hosts.
- **Endpoint Security** - Protecting end-user devices (laptops, mobiles) against threats.
- **Encryption** - Process of encoding data to prevent unauthorized access.
- **Firmware Security** - Securing firmware-level code against tampering and attacks.
- **Firewall** - Network security device that filters incoming and outgoing traffic based on rules.
- **Forensics** - Scientific analysis of digital evidence following a security incident.
- **Fuzzing** - Automated testing by sending malformed inputs to uncover vulnerabilities.
- **GRC (Governance, Risk, Compliance)** - Framework that aligns policies, risk management, and regulatory adherence.
- **Hashing** - Generating a fixed-size digest from data for integrity verification.
- **HMAC (Hash-based Message Authentication Code)** - Hashing method combined with a secret key for data integrity and authenticity.
- **HIDS (Host-based Intrusion Detection System)** - Tool monitoring system logs and behavior on individual hosts.
- **Honeypot** - Decoy system to attract attackers for study and early attack detection.
- **IAM (Identity and Access Management)** - Coordinated framework for defining and managing user identities and access privileges.
- **Incident Response** - Formal process to detect, analyze, and contain security incidents.
- **IDS (Intrusion Detection System)** - Tool that monitors network or system activity for malicious behavior.
- **IPS (Intrusion Prevention System)** - Security device that automatically blocks detected malicious traffic.
- **Insider Threat** - Risk posed by authorized users who misuse access, intentionally or accidentally.
- **Integrity Check** - Verification that files have not been altered outside of authorized processes.
- **IoT Security** - Protecting connected devices and the data they collect and transmit.
- **IP Spoofing** - Forging source IP addresses to conceal attacker identity or bypass filters.
- **HTTPS** - HTTP protocol secured with TLS encryption (https://).
- **Key Exchange** - Securely sharing cryptographic keys between parties.
- **Key Management** - Policies and procedures for secure generation, storage, and rotation of keys.
- **Least Privilege** - Security principle granting users minimum access needed to perform tasks.
- **LDAP Injection** - Attack exploiting unsanitized LDAP queries to manipulate directory services.
- **Log Management** - Collection, storage, and analysis of logs for auditing and incident detection.
- **MFA (Multi-factor Authentication)** - Using two or more factors (password, token, biometric) to verify identity.
- **MITM (Man-in-the-Middle) Attack** - Intercepting and potentially altering communication between parties.
- **NAT (Network Address Translation)** - Technique mapping internal IP addresses to a single public IP.
- **Packet Sniffing** - Capturing network packets to analyze or steal transmitted data.
- **Patch Management** - Process of keeping software up to date with security fixes.
- **Penetration Testing** - Authorized simulated attacks to identify and fix security vulnerabilities.
- **PGP (Pretty Good Privacy)** - Encryption program for securing email and files.
- **Phishing** - Fraudulent attempts to obtain sensitive information via deceptive messages or websites.
- **PKI (Public Key Infrastructure)** - System of digital certificates and keys for secure communications.
- **Privileged Access** - Elevated system permissions for administrators or service accounts.
- **Privilege Escalation** - Exploit that expands an attacker's access privileges.
- **Ransomware** - Malware that encrypts data and demands a ransom for the decryption key.
- **RBAC (Role-Based Access Control)** - Access control model assigning permissions based on user roles.
- **RDP (Remote Desktop Protocol)** - Microsoft protocol for remote graphical access to systems.
- **RPO (Recovery Point Objective)** - Maximum tolerable period in which data may be lost due to an incident.
- **RTO (Recovery Time Objective)** - Target duration to restore services after a disruption.
- **Red Team** - Security professionals simulating adversary techniques to test defenses.
- **Risk Assessment** - Analysis of potential threats, vulnerabilities, and impacts to inform mitigation.
- **RLS (Row-Level Security)** - Database feature enforcing access policies at the individual row level.
- **Salt** - Random data added to passwords before hashing to prevent precomputed attacks.
- **Sandboxing** - Executing code in an isolated environment to limit potential damage.
- **SCM (Source Code Management)** - Tools and practices for version control of code and configurations.
- **SIEM (Security Information and Event Management)** - Technology that aggregates and analyzes security-related data from multiple sources.
- **SLAs (Service Level Agreements)** - Contracts defining uptime, performance, and support standards.
- **Social Engineering** - Manipulating people to divulge confidential information or perform actions.
- **SCA (Software Composition Analysis)** - Scanning code dependencies for known vulnerabilities.
- **SPF (Sender Policy Framework)** - Email authentication protocol preventing sender address forging.
- **SSO (Single Sign-On)** - Authentication scheme allowing users to access multiple applications with one login.
- **SSH (Secure Shell)** - Protocol for secure remote command-line access and file transfers.
- **SSL (Secure Sockets Layer)** - Deprecated cryptographic protocol replaced by TLS for secure communications.
- **Threat Modeling** - Methodology for identifying potential threats and designing mitigations.
- **Tokenization** - Replacing sensitive data with non-sensitive equivalents (tokens) to reduce exposure.
- **TLS (Transport Layer Security)** - Cryptographic protocol providing privacy and data integrity over networks.
