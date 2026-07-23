const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

// --- CONFIGURAÇÃO ---
const DATA_FERIAS = new Date('2026-08-01'); // Dia da viagem
const GRUPO_ID = "120363409117435302@g.us"; // Substitui pelo ID exato que aparecer nos logs do GitHub para o "Gerês 2k26"

// --- CONTEÚDO DIÁRIO (Texto formatado, Media e Sondagens) ---
const conteudoDiario = {
    9: {
        texto: "_Acordem malta!_ Faltam **9 DIAS** para a desgraça. 🍻 O centro de emprego que nos perdoe, mas o foco agora é outro!",
        imagem: 'https://media.tenor.com/9n9c_0uA1o0AAAAC/party-drunk.gif',
        sondagem: {
            pergunta: "Qual é a primeira cena a fazer quando chegarmos à casa?",
            opcoes: ["Beber uma jola d'penalti 🍺", "Mergulhar de cabeça na piscina 🏊‍♂️", "Escolher a melhor cama 🛏️"]
        }
    },
    8: {
        texto: "_Preparem os ouvidos!_ Só faltam **8 DIAS**! O **Quim Barreiros** já está a afinar o acordeão para a nossa terrinha! 🪗🍷",
        imagem: 'https://media.tenor.com/pQ_VXYB1BfwAAAAC/accordion-music.gif',
        sondagem: {
            pergunta: "Qual vai ser o hino oficial destas férias?",
            opcoes: ["A Garagem da Vizinha 🚗", "Bacalhau à Portuguesa 🐟", "Mestre de Culinária 👨‍🍳"]
        }
    },
    7: {
        texto: "_Cheirinho a magia no ar..._ Faltam **7 DIAS**! Alguém já começou a preparar os famosos **brownies de weed**, ou vamos comer bolos normais como a plebe? 🌿🍫",
        imagem: 'https://media.tenor.com/2X8s1F4P5W0AAAAC/snoop-dogg-smoke.gif',
        sondagem: {
            pergunta: "Como é que a malta vai acabar depois dos brownies?",
            opcoes: ["A rir para as paredes 🧱", "A dormir na berma da piscina 😴", "A debater física quântica 🌌"]
        }
    },
    6: {
        texto: "_Atenção equipa de natação!_ Faltam **6 DIAS**! A única cena a boiar na piscina vai ser a nossa dignidade. 🏊‍♂️🍺",
        imagem: 'https://media.tenor.com/rNOfp01D6e8AAAAC/pool-fail.gif',
        sondagem: {
            pergunta: "Quem vai ser o primeiro a cair na piscina de trombas?",
            opcoes: ["O mais nabo do grupo 🤡", "Um de nós por acidente 🏃‍♂️", "Vamos todos em fila indiana 🦆"]
        }
    },
    5: {
        texto: "_Alerta fígado!_ Menos de uma semana, faltam **5 DIAS**! Já compraram o Guronsan em pacote familiar para aguentar as festas da terrinha? 🚑💊",
        imagem: 'https://media.tenor.com/D4sXzS89Xh8AAAAC/hangover-the-hangover.gif',
        sondagem: {
            pergunta: "Quem vai ter a pior ressaca?",
            opcoes: ["O que mistura tudo 🌪️", "O que adormece ao sol 🦞", "O que diz 'só bebo mais uma' 🤥"]
        }
    },
    4: {
        texto: "_Modo lontra ativado!_ Só **4 DIAS**! Já não há volta a dar, o destino é o abismo e a cerveja é o nosso guia. 🏖️🥴",
        imagem: 'https://media.tenor.com/UfG2Q8T81zAAAAAC/beer-cheers.gif',
        sondagem: {
            pergunta: "O que vai acabar primeiro na nossa casa?",
            opcoes: ["O álcool 🍻", "A nossa sanidade mental 🧠", "O papel higiénico 🧻"]
        }
    },
    3: {
        texto: "_Contagem decrescente dura!_ Faltam **3 DIAS**! As malas estão feitas ou vão levar a roupa do corpo e fé em Deus? 🙏💼",
        imagem: 'https://media.tenor.com/eB3Mh-sQ-C4AAAAC/packing-suitcase.gif',
        sondagem: {
            pergunta: "Estado atual das malas:",
            opcoes: ["Tudo dobradinho 👔", "Atirar tudo para o saco às 3 da manhã 🎒", "Vou usar os calções dos outros 🩳"]
        }
    },
    2: {
        texto: "_O pânico instalou-se!_ Só **2 DIAS**! Esqueçam as entrevistas de emprego, a prioridade agora é treinar o levantamento do garrafão de 5 litros. 🏋️‍♂️🍷",
        imagem: 'https://media.tenor.com/yFq6Zc2Z158AAAAC/drink-up.gif',
        sondagem: {
            pergunta: "Preparação física atual:",
            opcoes: ["Em forma de barril 🛢️", "Atleta de bar 🥇", "Já estou com os copos 🥴"]
        }
    },
    1: {
        texto: "_É AMANHÃ!_ Falta **1 DIA** para a casa vir abaixo! Garrafão na mão, brownies no forno, e que a sorte nos acompanhe. 🚀🍾",
        imagem: 'https://media.tenor.com/Z42Lw6t07UAAAAAC/jonah-hill-yay.gif',
        sondagem: {
            pergunta: "Nível de ansiedade para amanhã:",
            opcoes: ["A tremer das mãos 🫨", "Já estou à porta com a mala 🚪", "BORA CARALHO!!! 🧨"]
        }
    }
};

async function executarBot() {
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
                setTimeout(resolve, 4000); // 4 segundos para sincronizar chats
            }
        });
    });

    try {
        // Lista todos os grupos nos logs do GitHub para confirmares o ID do "Gerês 2k26"
        const chats = await sock.groupFetchAllParticipating();
        console.log("--- GRUPOS DISPONÍVEIS NA CONTA ---");
        for (const [id, chat] of Object.entries(chats)) {
            console.log(`Nome: ${chat.subject} | ID: ${id}`);
        }
        console.log("----------------------------------");

        const hoje = new Date();
        const dataHojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        const dataFeriasSemHora = new Date(DATA_FERIAS.getFullYear(), DATA_FERIAS.getMonth(), DATA_FERIAS.getDate());

        const diffTempo = dataFeriasSemHora - dataHojeSemHora;
        const diffDias = Math.round(diffTempo / (1000 * 60 * 60 * 24));

        if (diffDias > 0) {
            if (conteudoDiario[diffDias]) {
                const diaAtual = conteudoDiario[diffDias];
                
                // 1. Enviar a Imagem/GIF com o texto como legenda
                await sock.sendMessage(GRUPO_ID, { 
                    image: { url: diaAtual.imagem }, 
                    caption: diaAtual.texto 
                });
                
                // 2. Enviar a Sondagem logo a seguir (Formato Baileys Poll)
                await sock.sendMessage(GRUPO_ID, {
                    poll: {
                        name: diaAtual.sondagem.pergunta,
                        values: diaAtual.sondagem.opcoes,
                        selectableCount: 1
                    }
                });
                
                console.log(`[DIA ${diffDias}] Imagem, texto e sondagem enviados com sucesso!`);
            } else {
                await sock.sendMessage(GRUPO_ID, { text: `Faltam ${diffDias} dias! Preparem-se! 🍻` });
                console.log(`[DIA ${diffDias}] Mensagem de fallback enviada!`);
            }

        } else if (diffDias === 0) {
            await sock.sendMessage(GRUPO_ID, { 
                image: { url: 'https://media.tenor.com/8QzXkPnt7V0AAAAC/minions-party.gif' }, 
                caption: "🚨 **É HOJE MALTA!!!** BORA APANHAR A PUTA! 🎉✈️🍻🪗🍫" 
            });
            console.log("[DIA 0] Mensagem final enviada!");
        } else {
            console.log("As férias já passaram.");
        }

    } catch (error) {
        console.error("Erro na execução do bot:", error);
    }

    // Dá 5 segundos para garantir que a rede despacha tudo e fecha
    setTimeout(() => {
        process.exit(0);
    }, 5000);
}

executarBot();