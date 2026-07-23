const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');

const GRUPO_ID = "SEU_ID_DO_GRUPO_AQUI@g.us"; 
const DATA_FERIAS = new Date(2026, 7, 1); // 1 de Agosto de 2026

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            // Gera o QR code diretamente em texto no terminal
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada. A tentar reconectar...', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('Bot conectado com sucesso ao WhatsApp!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    async function verificarEEnviar(tarefaCron) {
        try {
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
                if (tarefaCron) tarefaCron.stop();
                process.exit(0);
            } else {
                console.log("As férias já passaram.");
                if (tarefaCron) tarefaCron.stop();
                process.exit(0);
            }
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        }
    }

    // Dispara todos os dias às 08:00
    const tarefaAgendada = cron.schedule('0 8 * * *', () => {
        verificarEEnviar(tarefaAgendada);
    });
}

connectToWhatsApp();