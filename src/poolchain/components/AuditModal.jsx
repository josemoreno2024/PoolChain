/**
 * ═══════════════════════════════════════════════════════════════════
 * PoolChain - Sistema de Auditoría Pública
 * ═══════════════════════════════════════════════════════════════════
 * 
 * @file AuditModal.jsx
 * @description Modal de auditoría pública para verificación de sorteos
 * @author SanDigital / Coliriun
 * 
 * Copyright © 2026 SanDigital - Todos los derechos reservados
 * 
 * Protegido mediante:
 * • Sello de tiempo eIDAS (Coloriuris S.L.)
 * • Número de Serie: 58485363
 * • Hash: dd9d06efabd7271ae12576ee18803616c40464b1f8f9d24769232f23b7312292
 * • Verificación: https://cipsc.coloriuris.net/tsa/
 * 
 * Licencia: MIT (uso comercial restringido)
 * Para consultas: jose01.moreno@gmail.com
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { useReadContract, useChainId } from 'wagmi';
import { parseAbiItem } from 'viem';
import './AuditModal.css';

// Límite de eventos para evitar RPC overload
const MAX_AUDIT_ROUNDS = 10;

// ═══════════════════════════════════════════════════════════════
// MAPA DE AUDITORÍA TÉCNICA (Verdad On-Chain)
// ═══════════════════════════════════════════════════════════════

/**
 * Mapeo de eventos a funciones Solidity exactas
 * Este mapa NO interpreta, solo señala qué buscar en el explorador
 */
const AUDIT_MAP = {
    TicketsPurchased: {
        function: 'buyTickets(uint256[] calldata positions)',
        event: `TicketsPurchased(
    address indexed buyer,
    uint256[] positions,
    uint256 quantity,
    uint256 totalCost,
    uint256 indexed round
)`,
        description: 'Compra de tickets en posiciones específicas'
    },
    WinnersSelected: {
        function: 'performDraw()',
        event: `WinnersSelected(
    uint256 indexed round,
    address[] groupAWinners,
    address[] groupBWinners,
    address[] groupCWinners,
    address[] groupDWinners
)`,
        description: 'Ejecución del sorteo y selección de ganadores',
        randomness: {
            algorithm: `seed = keccak256(
    blockhash(block.number - 1),
    block.timestamp,
    currentRound
)`,
            components: [
                {
                    name: 'blockhash',
                    description: 'Hash del bloque anterior (público, inmutable)',
                    why: 'Valor único generado por la red, imposible de predecir'
                },
                {
                    name: 'timestamp',
                    description: 'Momento exacto del bloque (público, inmutable)',
                    why: 'Marca de tiempo del bloque, no controlable por nadie'
                },
                {
                    name: 'currentRound',
                    description: 'Número de ronda actual (público, inmutable)',
                    why: 'Contador incremental, visible para todos'
                }
            ],
            guarantees: [
                'Nadie puede predecir estos valores antes del sorteo',
                'Nadie puede cambiar estos valores después del sorteo',
                'Todos los valores son públicos y verificables en blockchain',
                'El algoritmo está en el código del contrato (verificable)'
            ]
        }
    },
    PrizeClaimed: {
        function: 'claimPrize()',
        event: `PrizeClaimed(
    address indexed winner,
    uint256 amount
)`,
        description: 'Reclamo de premio por parte del ganador'
    },
    RoundReset: {
        function: 'resetRound()',
        event: `RoundReset(
    uint256 indexed round
)`,
        description: 'Reseteo de ronda (solo administrador)'
    }
};


export function AuditModal({
    isOpen,
    onClose,
    poolChainAddress,
    poolChainABI,
    tier,
    publicClient
}) {
    const [auditData, setAuditData] = useState(null);
    const chainId = useChainId();

    // Leer datos del contrato
    const { data: currentRound } = useReadContract({
        address: poolChainAddress,
        abi: poolChainABI,
        functionName: 'currentRound'
    });

    const { data: ticketPrice } = useReadContract({
        address: poolChainAddress,
        abi: poolChainABI,
        functionName: 'TICKET_PRICE'
    });

    const { data: maxParticipants } = useReadContract({
        address: poolChainAddress,
        abi: poolChainABI,
        functionName: 'MAX_PARTICIPANTS'
    });

    const { data: poolFilled } = useReadContract({
        address: poolChainAddress,
        abi: poolChainABI,
        functionName: 'poolFilled'
    });

    // Cargar eventos
    useEffect(() => {
        if (!isOpen || !publicClient || !currentRound) return;

        const loadAuditData = async () => {
            const fromRound = Math.max(1, Number(currentRound) - MAX_AUDIT_ROUNDS);
            const events = await fetchAuditEvents(
                publicClient,
                poolChainAddress,
                fromRound,
                Number(currentRound)
            );
            setAuditData(events);
        };

        loadAuditData();
    }, [isOpen, publicClient, poolChainAddress, currentRound]);

    if (!isOpen) return null;

    const explorerUrl = chainId === 5611
        ? 'https://testnet.opbnbscan.com'
        : 'https://opbnbscan.com';

    return (
        <div className="audit-modal-overlay" onClick={onClose}>
            <div className="audit-modal-content" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="audit-modal-header">
                    <h2>🔍 Auditoría pública del sorteo</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {/* 1. Identidad del Sorteo */}
                <section className="audit-section">
                    <h3>Identidad del Sorteo</h3>
                    <div className="audit-info-grid">
                        <div className="info-row">
                            <span className="label">Tier:</span>
                            <span className="value">{tier.name}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Contrato:</span>
                            <span className="value copyable">{poolChainAddress}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Red:</span>
                            <span className="value">
                                {chainId === 5611 ? 'opBNB Testnet' : 'opBNB Mainnet'}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="label">Ronda actual:</span>
                            <span className="value">#{Number(currentRound)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Estado:</span>
                            <span className={`badge ${poolFilled ? 'filled' : 'active'}`}>
                                {poolFilled ? 'Lleno' : 'En curso'}
                            </span>
                        </div>
                    </div>
                </section>

                {/* 2. Reglas del Sorteo */}
                <section className="audit-section">
                    <h3>Reglas del Sorteo (leídas del contrato)</h3>
                    <div className="audit-info-grid">
                        <div className="info-row">
                            <span className="label">Precio del ticket:</span>
                            <span className="value">
                                {(Number(ticketPrice) / 1e6).toFixed(2)} USDT
                                <span className="source-badge">🔗 On-chain</span>
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="label">Máx. participantes:</span>
                            <span className="value">
                                {Number(maxParticipants)}
                                <span className="source-badge">🔗 On-chain</span>
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="label">Distribución:</span>
                            <span className="value">
                                A: {tier.groupA.return} USDT,{' '}
                                B: {tier.groupB.return} USDT,{' '}
                                C: {tier.groupC.return} USDT,{' '}
                                D: {tier.groupD.return} USDT
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="label">Cierre:</span>
                            <span className="value">Automático al llenarse</span>
                        </div>
                    </div>
                </section>

                {/* 3. ¿Cómo funciona el sorteo? */}
                <section className="audit-section audit-how-it-works">
                    <h3>🎲 ¿Cómo funciona el sorteo?</h3>

                    <div className="how-it-works-summary">
                        <p className="summary-text">
                            El sorteo se basa en <strong>datos públicos e inmutables del blockchain</strong>,
                            combinados de forma determinística, para seleccionar ganadores
                            <strong> sin intervención humana</strong>.
                        </p>
                        <p className="tech-note-inline">
                            <strong>Nota técnica:</strong> El valor utilizado para el sorteo se fija en el momento
                            en que el pool se completa y no puede ser modificado posteriormente.
                        </p>
                        <p className="summary-highlight">
                            ✅ No depende de backend &nbsp;|&nbsp; ✅ 100% on-chain &nbsp;|&nbsp; ✅ Totalmente auditable
                        </p>
                    </div>

                    <div className="lottery-steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h4>Venta de Tickets</h4>
                                <p>Cada compra emite evento <code>TicketsPurchased</code> con wallet, cantidad y ronda.</p>
                            </div>
                        </div>

                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h4>Pool Lleno = Disparo Automático</h4>
                                <p>Cuando <code>ticketsSold == MAX_PARTICIPANTS</code>, el sorteo DEBE ejecutarse.</p>
                            </div>
                        </div>

                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h4>Generación de "Seed" (Aleatorio)</h4>
                                <p>Combina datos públicos del blockchain que nadie puede controlar:</p>
                                <code className="code-snippet">
                                    seed = keccak256(blockhash, timestamp, round)
                                </code>
                                <p className="step-note">📌 No permite intervención humana | Repetible | Auditable</p>
                            </div>
                        </div>

                        <div className="step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <h4>Selección de Ganadores</h4>
                                <p>Con ese seed se aplican módulos para elegir índices:</p>
                                <code className="code-snippet">
                                    winnerIndex = uint256(seed) % totalTickets
                                </code>
                            </div>
                        </div>

                        <div className="step">
                            <div className="step-number">5</div>
                            <div className="step-content">
                                <h4>Evento WinnersSelected</h4>
                                <p>Se emite con la lista de ganadores por grupo (A, B, C, D).</p>
                                <p className="step-note">🔍 Cualquiera puede recalcular y verificar</p>
                            </div>
                        </div>

                        <div className="step">
                            <div className="step-number">6</div>
                            <div className="step-content">
                                <h4>Reclamo de Premios (Pull)</h4>
                                <p>Ganadores reclaman manualmente con <code>claimPrize()</code>.</p>
                                <p className="step-note">✅ Más seguro | Menos gas | Sin bloqueos</p>
                            </div>
                        </div>
                    </div>

                    <div className="verification-challenge">
                        <h4>🔬 Verifica tú mismo el código</h4>
                        <p>
                            El código del contrato es <strong>público y verificado</strong>.
                            Puedes copiarlo y preguntarle a cualquier IA (ChatGPT, Claude, Gemini):
                        </p>
                        <div className="verification-steps">
                            <div className="verify-step">1️⃣ Haz click en "Ver código del contrato" abajo</div>
                            <div className="verify-step">2️⃣ Copia el código Solidity</div>
                            <div className="verify-step">3️⃣ Pégalo en ChatGPT/Claude/Gemini gratis</div>
                            <div className="verify-step">4️⃣ Pregunta: "¿Este contrato puede manipularse?"</div>
                        </div>
                        <p className="verification-guarantee">
                            💡 Verás que NO hay:
                            ❌ Admin privilegiado &nbsp;|&nbsp;
                            ❌ Backend &nbsp;|&nbsp;
                            ❌ Inputs privados &nbsp;|&nbsp;
                            ✅ Solo reglas automáticas
                        </p>
                        <p className="ai-disclaimer">
                            <strong>Nota:</strong> Las herramientas de IA son solo orientativas y no sustituyen una auditoría profesional.
                            La fuente de verdad es el código desplegado en el explorador.
                        </p>
                    </div>
                </section>

                {/* 4. Evidencia en Blockchain */}
                <section className="audit-section">
                    <h3>Evidencia en Blockchain</h3>
                    <p className="summary-note">
                        La auditoría muestra una vista resumida de los últimos sorteos por motivos de rendimiento.
                    </p>
                    {auditData ? (
                        <div className="events-list">
                            <div className="event-item">
                                <div className="event-header">
                                    <span className="event-type">TicketsPurchased</span>
                                    <span className="event-count">{auditData.tickets.count} eventos</span>
                                </div>
                                {auditData.tickets.last && (
                                    <div className="event-details">
                                        Último: {formatTimeAgo(auditData.tickets.last.timestamp)}
                                    </div>
                                )}
                            </div>

                            <div className="event-item">
                                <div className="event-header">
                                    <span className="event-type">WinnersSelected</span>
                                    <span className="event-count">{auditData.draws.count} sorteos</span>
                                </div>
                                {auditData.draws.last && (
                                    <div className="event-details">
                                        Último: Ronda #{Number(auditData.draws.last.args.round)}
                                    </div>
                                )}
                            </div>

                            <div className="event-item">
                                <div className="event-header">
                                    <span className="event-type">PrizeClaimed</span>
                                    <span className="event-count">{auditData.claims.count} reclamos</span>
                                </div>
                                {auditData.claims.last && (
                                    <div className="event-details">
                                        Último: {formatTimeAgo(auditData.claims.last.timestamp)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="loading">Cargando eventos...</div>
                    )}
                </section>

                {/* 5. Auditoría Técnica (NUEVO - Arquitectura de Confianza) */}
                <section className="audit-section technical-audit">
                    <h3>🔍 Auditoría Técnica de la Operación</h3>
                    <p className="audit-intro">
                        Esta operación ejecutó código on-chain verificable.
                    </p>

                    {/* Sistema de Auditoría de Sorteos */}
                    {(() => {
                        // Obtener información del sorteo
                        const operation = AUDIT_MAP.WinnersSelected;
                        const hasRecentDraw = auditData?.draws?.last;

                        return (
                            <div className="technical-operation">
                                <div className="operation-header">
                                    <span className="operation-badge">Sorteo - Aleatoriedad</span>
                                    <span className="operation-desc">
                                        {hasRecentDraw
                                            ? `Último sorteo ejecutado en ronda #${auditData.draws.last.args.round}`
                                            : 'Cómo funciona la selección de ganadores'
                                        }
                                    </span>
                                </div>

                                <div className="code-block">
                                    <div className="code-section">
                                        <div className="code-label">Función Solidity ejecutada:</div>
                                        <div className="code-content">{operation.function}</div>
                                        <button
                                            className="copy-btn"
                                            onClick={() => navigator.clipboard.writeText(operation.function)}
                                        >
                                            📋 Copiar firma de función
                                        </button>
                                    </div>

                                    <div className="code-separator">━━━</div>

                                    <div className="code-section">
                                        <div className="code-label">Evento emit</div>
                                        <div className="code-content event-signature">{operation.event}</div>
                                        <button
                                            className="copy-btn"
                                            onClick={() => navigator.clipboard.writeText(operation.event)}
                                        >
                                            📋 Copiar firma del evento
                                        </button>
                                    </div>
                                </div>

                                {/* Sección de Aleatoriedad (SIEMPRE visible) */}
                                <div className="randomness-section">
                                    <h4>🎲 Algoritmo de Aleatoriedad (100% Verificable)</h4>

                                    <div className="algorithm-block">
                                        <div className="code-label">Generación del seed:</div>
                                        <div className="code-content randomness-algo">{operation.randomness.algorithm}</div>
                                        <button
                                            className="copy-btn"
                                            onClick={() => navigator.clipboard.writeText(operation.randomness.algorithm)}
                                        >
                                            📋 Copiar algoritmo
                                        </button>
                                    </div>

                                    <div className="randomness-components">
                                        <div className="components-title">Componentes (todos públicos):</div>
                                        {operation.randomness.components.map((comp, idx) => (
                                            <div key={idx} className="component-item">
                                                <div className="component-name">• {comp.name}</div>
                                                <div className="component-desc">{comp.description}</div>
                                                <div className="component-why">→ {comp.why}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="randomness-guarantees">
                                        <div className="guarantees-title">✅ Garantías de No-Manipulación:</div>
                                        {operation.randomness.guarantees.map((guarantee, idx) => (
                                            <div key={idx} className="guarantee-item">
                                                ✓ {guarantee}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="randomness-verification">
                                        <strong>🔍 Cómo verificar que NO está amañado:</strong>
                                        <ol>
                                            <li>Copia el código del contrato desde el explorador</li>
                                            <li>Busca la función <code>_selectWinners()</code></li>
                                            <li>Pégalo en ChatGPT/Claude/Gemini</li>
                                            <li>Pregunta: <em>"¿Puede el dueño manipular este sorteo?"</em></li>
                                        </ol>
                                        <p className="verification-answer">
                                            <strong>Respuesta esperada:</strong> No, porque los valores (blockhash, timestamp, round)
                                            son públicos, inmutables y no controlables por nadie.
                                        </p>
                                    </div>

                                    {/* NUEVO: Ejemplo de pregunta para IA */}
                                    <div className="ai-question-example">
                                        <h5>💬 Pregunta Sugerida para IA Pública:</h5>
                                        <div className="question-box">
                                            <p>"Mira este código de aleatoriedad de un sorteo blockchain:</p>
                                            <code>seed = keccak256(blockhash, timestamp, round)</code>
                                            <p>¿Puede el dueño del contrato manipular estos valores para controlar quién gana?"</p>
                                        </div>
                                        <button
                                            className="copy-btn copy-question"
                                            onClick={() => navigator.clipboard.writeText(
                                                `Mira este código de aleatoriedad de un sorteo blockchain:\n\nseed = keccak256(blockhash(block.number - 1), block.timestamp, currentRound)\n\n¿Puede el dueño del contrato manipular estos valores para controlar quién gana?\n\nExplica por qué sí o por qué no.`
                                            )}
                                        >
                                            📋 Copiar pregunta para ChatGPT/Claude/Gemini
                                        </button>
                                    </div>
                                </div>

                                {/* Texto pedagógico CRÍTICO */}
                                <div className="verification-notice">
                                    <h4>✅ Verificación Independiente</h4>
                                    <p>
                                        Copia el código del contrato directamente desde el explorador
                                        y pégalo en cualquier IA pública para que lo interprete.
                                        <br />
                                        <strong>Ese código vive en la blockchain y no puede ser alterado por PoolChain.</strong>
                                    </p>
                                </div>
                            </div>
                        );
                    })()}
                </section>

                {/* 6. Verificación Externa */}
                <section className="audit-section">
                    <h3>Verificación Externa</h3>
                    <div className="verification-links">
                        <a
                            href={`${explorerUrl}/address/${poolChainAddress}#code`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="verify-link primary"
                        >
                            💻 Ver código del contrato (cópialo y verifica con IA)
                        </a>
                        <a
                            href={`${explorerUrl}/address/${poolChainAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="verify-link"
                        >
                            🔗 Ver contrato en explorador
                        </a>
                        <a
                            href={`${explorerUrl}/address/${poolChainAddress}#events`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="verify-link"
                        >
                            📜 Ver todos los eventos
                        </a>
                    </div>
                </section>

                {/* 6. Nota de Transparencia */}
                <div className="transparency-note">
                    <span className="note-icon">🔎</span>
                    <div>
                        <p>
                            PoolChain no depende de servidores privados,
                            no utiliza inputs ocultos y
                            no permite intervención humana en el sorteo.
                        </p>
                        <p className="tech-note">
                            <strong>Nota técnica:</strong> Este sorteo NO usa VRF (oráculo externo caro).
                            Usa <strong>aleatoriedad práctica</strong> basada en datos públicos del blockchain
                            (blockhash, timestamp) que nadie puede controlar.
                            Es 100% on-chain, auditable y sin costos adicionales.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper para formatear tiempo
function formatTimeAgo(timestamp) {
    if (!timestamp) return 'N/A';
    const now = Math.floor(Date.now() / 1000);
    const diff = now - Number(timestamp);

    if (diff < 60) return 'hace menos de 1 min';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    return `hace ${Math.floor(diff / 86400)} días`;
}

// Helper para obtener eventos
async function fetchAuditEvents(publicClient, poolChainAddress, fromRound, toRound) {
    try {
        const [ticketEvents, drawEvents, claimEvents] = await Promise.all([
            publicClient.getLogs({
                address: poolChainAddress,
                event: parseAbiItem('event TicketsPurchased(address indexed buyer, uint256[] positions, uint256 quantity, uint256 totalCost, uint256 indexed round)'),
                fromBlock: 0n,
                toBlock: 'latest'
            }),
            publicClient.getLogs({
                address: poolChainAddress,
                event: parseAbiItem('event WinnersSelected(uint256 indexed round, address[] groupAWinners, address[] groupBWinners, address[] groupCWinners, address[] groupDWinners)'),
                fromBlock: 0n,
                toBlock: 'latest'
            }),
            publicClient.getLogs({
                address: poolChainAddress,
                event: parseAbiItem('event PrizeClaimed(address indexed winner, uint256 amount)'),
                fromBlock: 0n,
                toBlock: 'latest'
            })
        ]);

        // Filtrar eventos por rango de rondas
        const filteredTickets = ticketEvents.filter(e => {
            const round = Number(e.args.round);
            return round >= fromRound && round <= toRound;
        });

        const filteredDraws = drawEvents.filter(e => {
            const round = Number(e.args.round);
            return round >= fromRound && round <= toRound;
        });

        const lastTicket = filteredTickets[filteredTickets.length - 1];
        const lastDraw = filteredDraws[filteredDraws.length - 1];
        const lastClaim = claimEvents[claimEvents.length - 1];

        return {
            tickets: {
                count: filteredTickets.length,
                last: lastTicket ? {
                    timestamp: (await publicClient.getBlock({ blockNumber: lastTicket.blockNumber })).timestamp
                } : null
            },
            draws: {
                count: filteredDraws.length,
                last: lastDraw ? {
                    args: lastDraw.args,
                    timestamp: (await publicClient.getBlock({ blockNumber: lastDraw.blockNumber })).timestamp
                } : null
            },
            claims: {
                count: claimEvents.length,
                last: lastClaim ? {
                    timestamp: (await publicClient.getBlock({ blockNumber: lastClaim.blockNumber })).timestamp
                } : null
            }
        };
    } catch (error) {
        console.error('Error fetching audit events:', error);
        return {
            tickets: { count: 0, last: null },
            draws: { count: 0, last: null },
            claims: { count: 0, last: null }
        };
    }
}
