# ProgettoWebRTC: M&LiveStreaming 📲
## Sommario
 
1. **Descrizione del Progetto**
2. **Tecnologie Utilizzate**
3. **Struttura del Progetto**
4. **Descrizione dei Componenti**
    - `App.js`
    - `Home.js`
    - `Broadcaster.js`
    - `Viewer.js`
5. **Dettagli di Implementazione**
    - WebRTC
    - Socket.io
    - Gestione degli Stream
6. **Funzionamento Generale**
7. **Considerazioni Finali**

---
 
## 1. Descrizione del Progetto
 
Il progetto è un'applicazione mobile che consente agli utenti di trasmettere e visualizzare flussi video in tempo reale. La piattaforma permette a un utente di avviare una trasmissione video (il "broadcaster") e ad altri utenti di unirsi alla diretta come "viewer". La comunicazione tra i vari componenti dell'app viene gestita tramite WebRTC per il flusso multimediale e Socket.IO per il signaling tra i dispositivi.
 
---

## 2. Tecnologie Utilizzate
 
- **React Native**: Framework per la costruzione di applicazioni mobili per iOS e Android utilizzando JavaScript e React.
- **WebRTC**: Tecnologia che consente la comunicazione peer-to-peer (P2P) per lo streaming audio e video in tempo reale.
- **Socket.IO**: Libreria per la comunicazione in tempo reale tra client e server attraverso WebSockets, utilizzata per il signaling e la gestione degli eventi in tempo reale.
- **React Navigation**: Libreria per la gestione della navigazione tra le schermate dell'app.
- **React Native WebRTC**: Modulo per integrare WebRTC con React Native, permettendo la gestione dei flussi audio e video.
 
---

## 3. Setup del Progetto
 
Dopo aver scaricato il progetto dal repository GitHub, è necessario seguire questi passaggi per configurare correttamente l'ambiente di sviluppo ed eseguire l'applicazione.
 
### 1. **Clonare il Repository**
 
Per prima cosa, assicurati di avere **Git** installato sul tuo sistema. Se non hai ancora clonato il progetto, esegui il comando seguente per ottenere una copia del repository:
 
```bash
git clone https://github.com/username/repository-name.git
```
 
Sostituisci `https://github.com/username/repository-name.git` con l'URL effettivo del tuo repository GitHub.
 
### 2. **Installare Node.js**
 
Il progetto richiede **Node.js** (versione 18 o superiore) per gestire le dipendenze. Puoi scaricare e installare Node.js dal [sito ufficiale](https://nodejs.org/).
 
Verifica di avere la versione corretta di Node.js eseguendo:
 
```bash
node -v
```
 
Assicurati che la versione sia almeno la 18.x.x, come specificato nel file `package.json` sotto `engines`.
 
### 3. **Installare le Dipendenze**
 
Accedi alla cartella del progetto e installa le dipendenze necessarie utilizzando **npm** o **yarn**.
 
Esegui il comando nella directory principale del progetto:
 
```bash
cd nome-del-progetto
npm install
```
 
Oppure se stai usando **yarn**:
 
```bash
yarn install
```
 
Questo comando installerà tutte le dipendenze elencate nel file `package.json`.
 
### 4. **Configurare il Progetto per Android e iOS**
 
Per avviare l'applicazione su un dispositivo o emulatore Android o iOS, è necessario avere correttamente configurato il proprio ambiente di sviluppo. Ecco i passaggi:
 
#### a. **Android**
 
- Assicurati di avere **Android Studio** installato. Se non ce l'hai, puoi scaricarlo da [qui](https://developer.android.com/studio).
- Verifica di avere configurato correttamente le **variabili d'ambiente** per Android, inclusi `ANDROID_HOME` e il path verso gli SDK Android. Puoi seguire la [guida ufficiale di React Native per Android](https://reactnative.dev/docs/environment-setup) per configurare l'ambiente di sviluppo su Android.
 
#### b. **iOS (Solo per macOS)**
 
- Per sviluppare su **iOS**, hai bisogno di un **Mac** con **Xcode** installato. Puoi scaricare Xcode dal Mac App Store.
- Verifica che tu abbia Xcode correttamente configurato e che le versioni di **CocoaPods** siano aggiornate.
 
```bash
sudo gem install cocoapods
```
 
### 5. **Avviare il Server di Metro**
 
Il server di **Metro** è un server di bundling per React Native che gestisce il caricamento del codice JavaScript durante lo sviluppo. Avvia il server di Metro con il comando:
 
```bash
npm start
```
 
Questo avvierà il bundler in modalità di sviluppo. Lascia aperto questo terminale, poiché dovrai mantenere il server in esecuzione.
 
### 6. **Eseguire l'App su Android o iOS**
 
#### a. **Android**
 
Se hai un dispositivo Android collegato o un emulatore in esecuzione, puoi eseguire l'app con il comando:
 
```bash
npm run android
```
 
Questo avvierà l'app sul dispositivo o sull'emulatore Android.
 
#### b. **iOS**
 
Se stai lavorando su macOS e hai Xcode configurato correttamente, puoi eseguire l'app su un dispositivo iOS o su un simulatore iOS con il comando:
 
```bash
npm run ios
```
 
Questo avvierà l'app sul simulatore iOS o sul dispositivo fisico (se configurato).
 
### 7. **Testare il Progetto**
 
Una volta avviato l'ambiente di sviluppo e l'app, puoi testare il funzionamento dell'applicazione. Per eseguire i test unitari e le verifiche, esegui:
 
```bash
npm test
```
 
Questo comando avvierà **Jest**, il framework di test configurato nel progetto.
 
### 8. **Configurazioni Aggiuntive**
 
Se stai configurando un ambiente di produzione o se hai bisogno di configurazioni aggiuntive per il progetto (ad esempio, un server di back-end per la gestione dei segnali tramite Socket.IO), assicurati di seguire le istruzioni fornite nel repository specifico per la configurazione di queste parti.
 
---
 
## 9. Risoluzione dei Problemi Comuni
 
Se dovessi riscontrare errori durante il setup, ecco alcune soluzioni comuni:
 
1. **Problema con le dipendenze**:
   Se alcuni pacchetti non si installano correttamente, prova a cancellare la cartella `node_modules` e il file `package-lock.json`, quindi reinstalla le dipendenze:
 
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```
 
2. **Errore in Android**:
   Se hai problemi a eseguire l'app su Android, verifica che il tuo ambiente Android sia configurato correttamente e che tu stia utilizzando una versione di **Gradle** compatibile con il progetto. Se necessario, esegui `gradlew clean` nella cartella `android` per pulire e ricostruire il progetto.
 
3. **Errore in iOS**:
   Se hai problemi a eseguire l'app su iOS, prova a fare una pulizia del progetto iOS:
 
   ```bash
   cd ios
   pod install
   cd ..
   ```
 
   Questo aggiornerà le dipendenze di CocoaPods.
 
---

# Setup 💻

## Step 1️⃣

## Step 2️⃣


# Componenti sistema

