const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

const GRUPO_ID = "Gerês 2k26"; // Mantém o teu ID
const DATA_FERIAS = new Date(2026, 7, 1); // 1 de Agosto de 2026

async function enviarMensagem() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    // Espera a conexão abrir e estabilizar
    await new Promise((resolve) => {
        sock.ev.on('connection.update', (update) => {
            if (update.connection === 'open') {
                setTimeout(resolve, 3000); // Dá 3 segundos para sincronizar os chats
            }
        });
    });

    try {
        const hoje = new Date();
        const diffTempo = DATA_FERIAS.getTime() - hoje.getTime();
        const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

        let textoMensagem = "";
        if (diffDias > 0) {
            textoMensagem = diffDias === 1 ? "Falta 1 dia! Preparem-se!" : `Faltam ${diffDias} dias para as férias!`;
        } else if (diffDias === 0) {
            textoMensagem = "É HOJE MALTA! BORA!";
        } else {
            textoMensagem = "As férias já passaram.";
        }

        console.log(`A enviar mensagem para o grupo: ${GRUPO_ID}`);
        await sock.sendMessage(GRUPO_ID, { text: textoMensagem });
        console.log("Mensagem enviada com sucesso!");

    } catch (error) {
        console.error("Erro detalhado ao enviar:", error);
    }

    setTimeout(() => {
        process.exit(0);
    }, 5000);
}

enviarMensagem();