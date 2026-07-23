const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

const GRUPO_ID = "SEU_ID_DO_GRUPO_AQUI@g.us"; // Substitui pelo ID exato que vai aparecer nos logs do GitHub para o "Gerês 2k26"
const DATA_FERIAS = new Date(2026, 7, 1); // 1 de Agosto de 2026

async function enviarMensagem() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    await new Promise((resolve) => {
        sock.ev.on('connection.update', (update) => {
            if (update.connection === 'open') {
                setTimeout(resolve, 4000); // 4 segundos para carregar os chats da conta
            }
        });
    });

    try {
        // Lista todos os grupos disponíveis na sessão para confirmares o ID nos logs do GitHub
        const chats = await sock.groupFetchAllParticipating();
        console.log("--- GRUPOS DISPONÍVEIS NA CONTA ---");
        for (const [id, chat] of Object.entries(chats)) {
            console.log(`Nome: ${chat.subject} | ID: ${id}`);
        }
        console.log("----------------------------------");

        const hoje = new Date();
        const diffTempo = DATA_FERIAS.getTime() - hoje.getTime();
        const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

        let textoMensagem = diffDias > 0 ? (diffDias === 1 ? "Falta 1 dia! Preparem-se!" : `Faltam ${diffDias} dias para as férias!`) : "É HOJE MALTA! BORA!";

        console.log(`A tentar enviar para: ${GRUPO_ID}`);
        await sock.sendMessage(GRUPO_ID, { text: textoMensagem });
        console.log("Mensagem enviada com sucesso!");

    } catch (error) {
        console.error("Erro ao enviar:", error);
    }

    setTimeout(() => {
        process.exit(0);
    }, 5000);
}

enviarMensagem();