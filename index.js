const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

const GRUPO_ID = "SEU_ID_DO_GRUPO_AQUI@g.us"; 
const DATA_FERIAS = new Date(2026, 7, 1); // 1 de Agosto de 2026

async function enviarMensagem() {
    // Usa a pasta de sessão que está guardada no repositório
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    // Espera un pouco até estabelecer a ligação por socket
    await new Promise((resolve) => {
        sock.ev.on('connection.update', (update) => {
            if (update.connection === 'open') {
                resolve();
            }
        });
    });

    const hoje = new Date();
    const diffTempo = DATA_FERIAS.getTime() - hoje.getTime();
    const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

    console.log(`Faltam ${diffDias} dias para as férias.`);

    if (diffDias > 0) {
        if (diffDias === 1) {
            await sock.sendMessage(GRUPO_ID, { text: "Falta 1 dia! Preparem-se!" });
        } else {
            await sock.sendMessage(GRUPO_ID, { text: `Faltam ${diffDias} dias para as férias!` });
        }
    } else if (diffDias === 0) {
        await sock.sendMessage(GRUPO_ID, { text: "É HOJE MALTA! BORA!" });
    }

    // Dá 5 segundos para garantir que a mensagem é enviada e fecha o processo
    setTimeout(() => {
        process.exit(0);
    }, 5000);
}

enviarMensagem();