# Secure Transaction Vault

**Enterprise-Grade Secure Data Storage System**

A full-stack monorepo application designed to demonstrate a high-assurance **Envelope Encryption** architecture. This system allows users to securely encrypt, store, and retrieve sensitive transaction payloads, ensuring that data at rest is cryptographically isolated from the keys used to protect it.

---

## 🏗 System Architecture

The project is structured as a **Turborepo** monorepo, enforcing strict boundary separation between the user interface, the API gateway, and the core cryptographic logic.



### 1. Frontend (`apps/web`)
* **Framework:** **Next.js** (React)
* **Role:** The user-facing dashboard. It provides a clean, responsive interface for inputting sensitive JSON payloads, viewing encrypted records (ciphertext), and requesting decryption.
* **Key Features:**
    * Real-time interaction with the API.
    * Visualizes the "before" (plaintext) and "after" (ciphertext) states.
    * Error handling for tampered data.

### 2. Backend API (`apps/api`)
* **Framework:** **Fastify** (Node.js)
* **Role:** The high-performance REST gateway. It orchestrates the encryption lifecycle and manages persistence.
* **Design:** Layered Architecture (Controller -> Service -> Storage).
* **Storage Strategy:** Configurable via **Adapter Pattern**.
    * **Development:** In-Memory `Map` (Zero setup).
    * **Production:** **PostgreSQL** via **Prisma ORM**.

### 3. Core Security Library (`packages/crypto`)
* **Role:** The isolated "brain" of the operation. This package contains *all* cryptographic primitives and validation logic.
* **Algorithm:** **AES-256-GCM** (Authenticated Encryption).
* **Why Shared?** By isolating crypto logic in a shared package, we ensure consistent security standards across any future services or microservices that join the repo.

---

## 🔐 Security Deep Dive: Envelope Encryption

This project implements the industry-standard **Envelope Encryption** pattern to solve the "Key Management Problem."

1.  **Data Encryption Key (DEK):** Every single transaction generates a *brand new* random 256-bit key. The payload is encrypted with this key.
2.  **Key Wrapping:** The DEK itself is then encrypted ("wrapped") using the persistent **Master Key**.
3.  **Storage:** The database stores:
    * The Encrypted Payload
    * The Encrypted DEK
    * **ZERO** plaintext keys.
4.  **Decryption:** To read data, the system must first unwrap the DEK using the Master Key, then use the DEK to decrypt the payload.

> **Benefit:** If the database is leaked, the attacker sees only ciphertext. They cannot decrypt anything without the Master Key, which is held separately in the application environment.

---

## 🚀 Quick Start Guide

**Prerequisites:** Node.js 20+, pnpm.

```bash
# 1. Install dependencies across the monorepo
pnpm install

# 2. Setup environment (if using Prisma/DB)
# Copy .env.example to .env in apps/api

# 3. Start the entire stack (Frontend + Backend)
pnpm dev