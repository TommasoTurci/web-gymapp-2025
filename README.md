# Gym Management System

<div align="center">

[![Vue.js](https://img.shields.io/badge/Vue.js-3-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Latest-339933?logo=node.js)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com/)

</div>

---

## Indice

- [About](#about)
- [Funzionalità](#funzionalità)
- [Tech Stack](#tech-stack)
- [Installazione](#installazione)
- [Struttura del Progetto](#struttura-del-progetto)
- [Ruoli e Permessi](#ruoli-e-permessi)
- [API Principali](#api-principali)

---

Un'applicazione web per la gestione di una palestra che consente di:

- **Organizzare** le attività della palestra in modo centralizzato
- **Comunicare** efficacemente tra proprietari, trainer e clienti
- **Gestire** servizi, abbonamenti, esercizi e ordini
- **Personalizzare** i piani di allenamento per ogni cliente

---

## Funzionalità

### Proprietario della Palestra
- ✅ Creare e modificare la palestra (nome, indirizzo, servizi)
- ✅ Gestire personal trainer (aggiungi, rimuovi)
- ✅ Gestire abbonamenti e prezzi
- ✅ Visualizzare dashboard con statistiche
- ✅ Gestire negozio (prodotti, ordini)

### Personal Trainer
- ✅ Visualizzare lista clienti
- ✅ Creare e gestire esercizi personali
- ✅ Assegnare esercizi ai clienti
- ✅ Creare piani di allenamento
- ✅ Monitorare progresso clienti

### Cliente
- ✅ Visualizzare informazioni palestra
- ✅ Consultare personal trainer assegnato
- ✅ Visualizzare schede di allenamento
- ✅ Acquistare prodotti dal negozio
- ✅ Tracciare ordini

---

### Frontend

| **Vue.js 3** |
| **Vue Router** |
| **Vite** |
| **Bootstrap 5** |
| **SCSS/Sass** |

### Backend

| **Node.js** |
| **Express.js** |
| **Supabase** |
| **PostgreSQL** |
| **JWT** |
| **bcrypt** |

---

## Installazione

### Prerequisiti
- Node.js
- npm
- Account Supabase

### Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### Setup Backend

```bash
cd backend
npm install
```

Crea un file `.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
PORT=3001
```

Avvia il server:
```bash
npm start
```

---

## Ruoli e Permessi

### Accesso e Registrazione

L'accesso avviene tramite schermata di login:

- **Registrazione**: Crea account con email/password e scegli il ruolo
- **Login**: Accedi con credenziali esistenti

### Permessi

| Azione | Owner | Trainer | Client |
|--------|-------|---------|--------|
| Gestire Palestra | ✅ | ❌ | ❌ |
| Gestire Trainer | ✅ | ❌ | ❌ |
| Gestire Clienti | ✅ | ✅ | ❌ |
| Creare Esercizi | ❌ | ✅ | ❌ |
| Visualizzare Ordini | ✅ | ❌ | ✅ |
| Acquistare Prodotti | ❌ | ❌ | ✅ |

---

## Mockup

Visualizza il mockup su [Figma](https://liver-finch-69598504.figma.site/)
