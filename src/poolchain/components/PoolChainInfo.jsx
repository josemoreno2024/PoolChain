import './PoolChainInfo.css'

export function PoolChainInfo() {
    return (
        <div className="poolchain-info">
            <section className="hero-pool" style={{ padding: '40px 20px', background: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)' }}>
                <div className="container">
                    <div className="hero-content fade-in" style={{ textAlign: 'center' }}>
                        <h1>📚 Información de PoolChain Raffles</h1>
                        <p className="subtitle">
                            Sistema innovador con múltiples ganadores - 98-99% retorna a participantes
                        </p>
                        <a href="/" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 32px', background: '#fbbf24', color: '#0f172a', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}>
                            ← Volver al Inicio
                        </a>
                    </div>
                </div>
            </section>

            <section className="what-is-poolchain">
                <div className="container">
                    <h2 className="text-center mb-xl">¿Qué es PoolChain Raffles?</h2>
                    <div className="revolutionary-concept">
                        <h3>Sistema de Múltiples Ganadores por Grupo</h3>
                        <p className="intro-text">
                            PoolChain es <strong>innovador</strong>: en lugar de tener solo 3 ganadores, tenemos <strong>60 a 100 ganadores por sorteo</strong> según el sorteo.
                            Los premios se distribuyen en grupos, creando una experiencia más justa, inclusiva y emocionante.
                        </p>
                    </div>

                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-icon">🎯</div>
                            <h3>Múltiples Ganadores</h3>
                            <p>De 60 a 100 ganadores por sorteo (100% ganan). Grupo A (premios grandes), Grupo B (premios medios), Grupo C (premios pequeños), Grupo D (devolución parcial).</p>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">🔄</div>
                            <h3>Modelo Híbrido</h3>
                            <p>Sorteos 1-6: 100 participantes, todos ganan. Sorteos 7-9: desde 60 hasta 100 participantes. El sistema se adapta para maximizar satisfacción.</p>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">🛡️</div>
                            <h3>Chainlink VRF</h3>
                            <p>Selección aleatoria verificable de todos los grupos. Imposible de manipular, 100% transparente.</p>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">⭐</div>
                            <h3>98-99% Retorna</h3>
                            <p>Gas del 1-2% para transacciones. El 98-99% se distribuye entre participantes. Recuperación mínima 49% en Grupo D.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="multi-winner-explanation">
                <div className="container">
                    <h2 className="text-center mb-xl">🌟 Sistema de Grupos de Ganadores</h2>

                    <div className="groups-explanation">
                        <div className="group-card">
                            <div className="group-badge">Grupo A</div>
                            <h3>Premios Grandes (30%)</h3>
                            <p>6-10 ganadores comparten el 30% del fondo neto. Premios individuales desde 5.88 USDT hasta 1,485 USDT según sorteo.</p>
                        </div>
                        <div className="group-card">
                            <div className="group-badge">Grupo B</div>
                            <h3>Premios Medios (30%)</h3>
                            <p>12-20 ganadores comparten el 30% del fondo neto. Premios individuales desde 2.94 USDT hasta 742.50 USDT según sorteo.</p>
                        </div>
                        <div className="group-card">
                            <div className="group-badge">Grupo C</div>
                            <h3>Premios Pequeños (20%)</h3>
                            <p>18-30 ganadores comparten el 20% del fondo neto. Premios individuales desde 1.31 USDT hasta 330 USDT según sorteo.</p>
                        </div>
                        <div className="group-card">
                            <div className="group-badge">Grupo D</div>
                            <h3>Devolución Parcial (20%)</h3>
                            <p>24-40 participantes comparten el 20% del fondo neto. Recuperación desde 0.98 USDT hasta 247.50 USDT (49-49.5% de la entrada).</p>
                        </div>
                    </div>
                </div>
            </section>


            <section className="raffle-tiers">
                <div className="container">
                    <h2 className="text-center mb-xl">🎰 Sorteos - Sistema de Múltiples Ganadores</h2>

                    <div className="tier-summary">
                        <p>Cada sorteo tiene una configuración específica de cupos y ganadores:</p>
                        <ul>
                            <li><strong>Sorteo 1 Micro:</strong> 100 cupos - 100 ganadores (100%) - Gas 3%</li>
                            <li><strong>Sorteos 2-6 (5-50 USDT):</strong> 100 cupos - 100 ganadores (100%) - Gas 2%</li>
                            <li><strong>Sorteos 7-9 (100-500 USDT):</strong> Gas 1%</li>
                            <li><strong>Sorteo 7 Elite:</strong> 100 cupos - 100 ganadores (100%)</li>
                            <li><strong>Sorteos 8-9 VIP/Diamante:</strong> 60 cupos - 60 ganadores (100%)</li>
                            <li><strong>Distribución unificada:</strong> 30% Grupo A / 30% Grupo B / 20% Grupo C / 20% Grupo D</li>
                        </ul>
                    </div>

                    {/* Sorteo 1: Micro */}
                    <div className="tier-detail">
                        <h3>Micro (2 USDT) - Modelo Amable</h3>
                        <div className="tier-stats">
                            <div className="stat">Fondo Bruto: <strong>200 USDT</strong></div>
                            <div className="stat">Gas 3%: <strong>6 USDT</strong></div>
                            <div className="stat">Fondo Neto: <strong>194 USDT</strong></div>
                            <div className="stat">Total Ganadores: <strong>100 de 100 (100%)</strong></div>
                        </div>
                        <table className="prize-table">
                            <thead>
                                <tr>
                                    <th>Grupo</th>
                                    <th>Ganadores</th>
                                    <th>% Fondo</th>
                                    <th>Total Grupo</th>
                                    <th>Premio Individual</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="group-a">
                                    <td>A</td>
                                    <td>10</td>
                                    <td>30%</td>
                                    <td>58.20 USDT</td>
                                    <td><strong>5.82 USDT</strong> (2.91x)</td>
                                </tr>
                                <tr className="group-b">
                                    <td>B</td>
                                    <td>20</td>
                                    <td>30%</td>
                                    <td>58.20 USDT</td>
                                    <td><strong>2.91 USDT</strong> (1.46x)</td>
                                </tr>
                                <tr className="group-c">
                                    <td>C</td>
                                    <td>30</td>
                                    <td>20%</td>
                                    <td>38.80 USDT</td>
                                    <td><strong>1.29 USDT</strong></td>
                                </tr>
                                <tr className="group-d">
                                    <td>D</td>
                                    <td>40</td>
                                    <td>20%</td>
                                    <td>38.80 USDT</td>
                                    <td><strong>0.97 USDT</strong> (49% recuperación)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Nivel 2: Mini */}
                    <div className="tier-detail">
                        <h3>Mini (5 USDT) - Modelo Amable</h3>
                        <div className="tier-stats">
                            <div className="stat">Fondo Bruto: <strong>500 USDT</strong></div>
                            <div className="stat">Gas 2%: <strong>10 USDT</strong></div>
                            <div className="stat">Fondo Neto: <strong>490 USDT</strong></div>
                            <div className="stat">Total Ganadores: <strong>100 de 100 (100%)</strong></div>
                        </div>
                        <table className="prize-table">
                            <thead>
                                <tr>
                                    <th>Grupo</th>
                                    <th>Cantidad</th>
                                    <th>% Fondo</th>
                                    <th>Total Grupo</th>
                                    <th>Premio Individual</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="group-a">
                                    <td>A</td>
                                    <td>10</td>
                                    <td>30%</td>
                                    <td>147 USDT</td>
                                    <td><strong>14.70 USDT</strong> (2.94x)</td>
                                </tr>
                                <tr className="group-b">
                                    <td>B</td>
                                    <td>20</td>
                                    <td>30%</td>
                                    <td>147 USDT</td>
                                    <td><strong>7.35 USDT</strong> (1.47x)</td>
                                </tr>
                                <tr className="group-c">
                                    <td>C</td>
                                    <td>30</td>
                                    <td>20%</td>
                                    <td>98 USDT</td>
                                    <td><strong>3.27 USDT</strong></td>
                                </tr>
                                <tr className="group-d">
                                    <td>D</td>
                                    <td>40</td>
                                    <td>20%</td>
                                    <td>98 USDT</td>
                                    <td><strong>2.45 USDT</strong> (49% recuperación)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Nivel 3: Básico */}
                    <div className="tier-detail">
                        <h3>Básico (10 USDT) - Modelo Base</h3>
                        <div className="tier-stats">
                            <div className="stat">Fondo Bruto: <strong>1,000 USDT</strong></div>
                            <div className="stat">Gas 2%: <strong>20 USDT</strong></div>
                            <div className="stat">Fondo Neto: <strong>980 USDT</strong></div>
                            <div className="stat">Total Ganadores: <strong>100 de 100 (100%)</strong></div>
                        </div>
                        <table className="prize-table">
                            <thead>
                                <tr>
                                    <th>Grupo</th>
                                    <th>Cantidad</th>
                                    <th>% Fondo</th>
                                    <th>Total Grupo</th>
                                    <th>Premio Individual</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="group-a">
                                    <td>A</td>
                                    <td>10</td>
                                    <td>30%</td>
                                    <td>294 USDT</td>
                                    <td><strong>29.40 USDT</strong> (2.94x)</td>
                                </tr>
                                <tr className="group-b">
                                    <td>B</td>
                                    <td>20</td>
                                    <td>30%</td>
                                    <td>294 USDT</td>
                                    <td><strong>14.70 USDT</strong> (1.47x)</td>
                                </tr>
                                <tr className="group-c">
                                    <td>C</td>
                                    <td>30</td>
                                    <td>20%</td>
                                    <td>196 USDT</td>
                                    <td><strong>6.53 USDT</strong></td>
                                </tr>
                                <tr className="group-d">
                                    <td>D</td>
                                    <td>40</td>
                                    <td>20%</td>
                                    <td>196 USDT</td>
                                    <td><strong>4.90 USDT</strong> (49% recuperación)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Nivel 4: Estándar */}
                    <div className="tier-detail">
                        <h3>Estándar (20 USDT) - Modelo Popular</h3>
                        <div className="tier-stats">
                            <div className="stat">Fondo Bruto: <strong>2,000 USDT</strong></div>
                            <div className="stat">Gas 2%: <strong>40 USDT</strong></div>
                            <div className="stat">Fondo Neto: <strong>1,960 USDT</strong></div>
                            <div className="stat">Total Ganadores: <strong>100 de 100 (100%)</strong></div>
                        </div>
                        <table className="prize-table">
                            <thead>
                                <tr>
                                    <th>Grupo</th>
                                    <th>Cantidad</th>
                                    <th>% Fondo</th>
                                    <th>Total Grupo</th>
                                    <th>Premio Individual</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="group-a">
                                    <td>A</td>
                                    <td>10</td>
                                    <td>30%</td>
                                    <td>588 USDT</td>
                                    <td><strong>58.80 USDT</strong> (2.94x)</td>
                                </tr>
                                <tr className="group-b">
                                    <td>B</td>
                                    <td>20</td>
                                    <td>30%</td>
                                    <td>588 USDT</td>
                                    <td><strong>29.40 USDT</strong> (1.47x)</td>
                                </tr>
                                <tr className="group-c">
                                    <td>C</td>
                                    <td>30</td>
                                    <td>20%</td>
                                    <td>392 USDT</td>
                                    <td><strong>13.07 USDT</strong></td>
                                </tr>
                                <tr className="group-d">
                                    <td>D</td>
                                    <td>40</td>
                                    <td>20%</td>
                                    <td>392 USDT</td>
                                    <td><strong>9.80 USDT</strong> (49% recuperación)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Nivel 5: Plus (ejemplo intermedio) */}
                    <div className="tier-detail">
                        <h3>Plus (40 USDT) - Modelo Base</h3>
                        <div className="tier-stats">
                            <div className="stat">Fondo Bruto: <strong>4,000 USDT</strong></div>
                            <div className="stat">Gas 2%: <strong>80 USDT</strong></div>
                            <div className="stat">Fondo Neto: <strong>3,920 USDT</strong></div>
                            <div className="stat">Total Ganadores: <strong>100 de 100 (100%)</strong></div>
                        </div>
                        <table className="prize-table">
                            <thead>
                                <tr>
                                    <th>Grupo</th>
                                    <th>Cantidad</th>
                                    <th>% Fondo</th>
                                    <th>Total Grupo</th>
                                    <th>Premio Individual</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="group-a">
                                    <td>A</td>
                                    <td>10</td>
                                    <td>30%</td>
                                    <td>1,176 USDT</td>
                                    <td><strong>117.60 USDT</strong> (2.94x)</td>
                                </tr>
                                <tr className="group-b">
                                    <td>B</td>
                                    <td>20</td>
                                    <td>30%</td>
                                    <td>1,176 USDT</td>
                                    <td><strong>58.80 USDT</strong> (1.47x)</td>
                                </tr>
                                <tr className="group-c">
                                    <td>C</td>
                                    <td>30</td>
                                    <td>20%</td>
                                    <td>784 USDT</td>
                                    <td><strong>26.13 USDT</strong></td>
                                </tr>
                                <tr className="group-d">
                                    <td>D</td>
                                    <td>40</td>
                                    <td>20%</td>
                                    <td>784 USDT</td>
                                    <td><strong>19.60 USDT</strong> (49% recuperación)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Nivel 6: Premium */}
                    <div className="tier-detail">
                        <h3>Premium (50 USDT) - Modelo Equilibrado</h3>
                        <div className="tier-stats">
                            <div className="stat">Fondo Bruto: <strong>5,000 USDT</strong></div>
                            <div className="stat">Gas 2%: <strong>100 USDT</strong></div>
                            <div className="stat">Fondo Neto: <strong>4,900 USDT</strong></div>
                            <div className="stat">Total Ganadores: <strong>100 de 100 (100%)</strong></div>
                        </div>
                        <table className="prize-table">
                            <thead>
                                <tr>
                                    <th>Grupo</th>
                                    <th>Cantidad</th>
                                    <th>% Fondo</th>
                                    <th>Total Grupo</th>
                                    <th>Premio Individual</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="group-a">
                                    <td>A</td>
                                    <td>10</td>
                                    <td>30%</td>
                                    <td>1,470 USDT</td>
                                    <td><strong>147 USDT</strong> (2.94x)</td>
                                </tr>
                                <tr className="group-b">
                                    <td>B</td>
                                    <td>20</td>
                                    <td>30%</td>
                                    <td>1,470 USDT</td>
                                    <td><strong>73.50 USDT</strong> (1.47x)</td>
                                </tr>
                                <tr className="group-c">
                                    <td>C</td>
                                    <td>30</td>
                                    <td>20%</td>
                                    <td>980 USDT</td>
                                    <td><strong>32.67 USDT</strong></td>
                                </tr>
                                <tr className="group-d">
                                    <td>D</td>
                                    <td>40</td>
                                    <td>20%</td>
                                    <td>980 USDT</td>
                                    <td><strong>24.50 USDT</strong> (49% recuperación)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Nivel 7: Elite */}
                    <div className="tier-detail">
                        <h3>Elite (100 USDT) - Modelo Avanzado</h3>
                        <div className="tier-stats">
                            <div className="stat">Fondo Bruto: <strong>10,000 USDT</strong></div>
                            <div className="stat">Gas 1%: <strong>100 USDT</strong></div>
                            <div className="stat">Fondo Neto: <strong>9,900 USDT</strong></div>
                            <div className="stat">Total Ganadores: <strong>100 de 100 (100%)</strong></div>
                        </div>
                        <table className="prize-table">
                            <thead>
                                <tr>
                                    <th>Grupo</th>
                                    <th>Cantidad</th>
                                    <th>% Fondo</th>
                                    <th>Total Grupo</th>
                                    <th>Premio Individual</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="group-a">
                                    <td>A</td>
                                    <td>10</td>
                                    <td>30%</td>
                                    <td>2,970 USDT</td>
                                    <td><strong>297 USDT</strong> (2.97x)</td>
                                </tr>
                                <tr className="group-b">
                                    <td>B</td>
                                    <td>20</td>
                                    <td>30%</td>
                                    <td>2,970 USDT</td>
                                    <td><strong>148.50 USDT</strong> (1.49x)</td>
                                </tr>
                                <tr className="group-c">
                                    <td>C</td>
                                    <td>30</td>
                                    <td>20%</td>
                                    <td>1,980 USDT</td>
                                    <td><strong>66 USDT</strong></td>
                                </tr>
                                <tr className="group-d">
                                    <td>D</td>
                                    <td>40</td>
                                    <td>20%</td>
                                    <td>1,980 USDT</td>
                                    <td><strong>49.50 USDT</strong> (49.5% recuperación)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Nivel 8: VIP */}
                    <div className="tier-detail">
                        <h3>VIP (200 USDT) - Modelo Exclusivo 60 Participantes</h3>
                        <div className="tier-stats">
                            <div className="stat">Fondo Bruto: <strong>12,000 USDT</strong></div>
                            <div className="stat">Gas 1%: <strong>120 USDT</strong></div>
                            <div className="stat">Fondo Neto: <strong>11,880 USDT</strong></div>
                            <div className="stat">Total Ganadores: <strong>60 de 60 (100%)</strong></div>
                        </div>
                        <table className="prize-table">
                            <thead>
                                <tr>
                                    <th>Grupo</th>
                                    <th>Cantidad</th>
                                    <th>% Fondo</th>
                                    <th>Total Grupo</th>
                                    <th>Premio Individual</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="group-a">
                                    <td>A</td>
                                    <td>6</td>
                                    <td>30%</td>
                                    <td>3,564 USDT</td>
                                    <td><strong>594 USDT</strong> (2.97x)</td>
                                </tr>
                                <tr className="group-b">
                                    <td>B</td>
                                    <td>12</td>
                                    <td>30%</td>
                                    <td>3,564 USDT</td>
                                    <td><strong>297 USDT</strong> (1.49x)</td>
                                </tr>
                                <tr className="group-c">
                                    <td>C</td>
                                    <td>18</td>
                                    <td>20%</td>
                                    <td>2,376 USDT</td>
                                    <td><strong>132 USDT</strong></td>
                                </tr>
                                <tr className="group-d">
                                    <td>D</td>
                                    <td>24</td>
                                    <td>20%</td>
                                    <td>2,376 USDT</td>
                                    <td><strong>99 USDT</strong> (49.5% recuperación)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Nivel 9: Diamante */}
                    <div className="tier-detail">
                        <h3>Diamante (500 USDT) - Modelo Exclusivo 60 Participantes</h3>
                        <div className="tier-stats">
                            <div className="stat">Fondo Bruto: <strong>30,000 USDT</strong></div>
                            <div className="stat">Gas 1%: <strong>300 USDT</strong></div>
                            <div className="stat">Fondo Neto: <strong>29,700 USDT</strong></div>
                            <div className="stat">Total Ganadores: <strong>60 de 60 (100%)</strong></div>
                        </div>
                        <table className="prize-table">
                            <thead>
                                <tr>
                                    <th>Grupo</th>
                                    <th>Cantidad</th>
                                    <th>% Fondo</th>
                                    <th>Total Grupo</th>
                                    <th>Premio Individual</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="group-a">
                                    <td>A</td>
                                    <td>6</td>
                                    <td>30%</td>
                                    <td>8,910 USDT</td>
                                    <td><strong>1,485 USDT</strong> (2.97x)</td>
                                </tr>
                                <tr className="group-b">
                                    <td>B</td>
                                    <td>12</td>
                                    <td>30%</td>
                                    <td>8,910 USDT</td>
                                    <td><strong>742.50 USDT</strong> (1.49x)</td>
                                </tr>
                                <tr className="group-c">
                                    <td>C</td>
                                    <td>18</td>
                                    <td>20%</td>
                                    <td>5,940 USDT</td>
                                    <td><strong>330 USDT</strong></td>
                                </tr>
                                <tr className="group-d">
                                    <td>D</td>
                                    <td>24</td>
                                    <td>20%</td>
                                    <td>5,940 USDT</td>
                                    <td><strong>247.50 USDT</strong> (49.5% recuperación)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </section>

            {/* Resto de secciones: Chainlink VRF, Recursos Educativos, etc. */}
            <section className="chainlink-vrf-section">
                <div className="container">
                    <h2 className="text-center mb-xl">🔐 ¿Qué es Chainlink VRF?</h2>

                    <div className="vrf-intro">
                        <p className="intro-text">
                            <strong>Chainlink VRF (Verifiable Random Function)</strong> es el estándar de oro para generar números aleatorios verificables en blockchain.
                            Es la tecnología que garantiza que la selección de TODOS los grupos sea 100% justa e imposible de manipular.
                        </p>
                    </div>

                    <div className="vrf-features">
                        <div className="vrf-feature">
                            <div className="vrf-icon">🔒</div>
                            <h4>Imposible de Manipular</h4>
                            <p>El número aleatorio se genera usando criptografía avanzada. Ni nosotros ni nadie puede predecir o alterar qué participantes van a cada grupo.</p>
                        </div>
                        <div className="vrf-feature">
                            <div className="vrf-icon">✅</div>
                            <h4>Verificable Públicamente</h4>
                            <p>Cada sorteo incluye una prueba criptográfica que cualquiera puede verificar en blockchain.</p>
                        </div>
                        <div className="vrf-feature">
                            <div className="vrf-icon">⚡</div>
                            <h4>Usado por los Mejores</h4>
                            <p>Chainlink VRF es usado por proyectos DeFi que manejan millones de dólares y por las plataformas NFT más importantes.</p>
                        </div>
                    </div>

                    <div className="vrf-process">
                        <h3>Cómo Funciona el Proceso:</h3>
                        <ol className="vrf-steps">
                            <li><strong>Solicitud:</strong> Cuando se llenan los cupos (100 o 60 según el sorteo), el contrato solicita un número aleatorio a Chainlink VRF</li>
                            <li><strong>Generación:</strong> Los nodos de Chainlink generan el número usando criptografía segura fuera de la blockchain</li>
                            <li><strong>Prueba:</strong> Se crea una prueba matemática que demuestra que el número es genuinamente aleatorio</li>
                            <li><strong>Verificación:</strong> El contrato verifica la prueba antes de aceptar el número</li>
                            <li><strong>Selección de Grupos:</strong> El número verificado se usa para seleccionar aleatoriamente quién va a cada grupo (A, B, C, D)</li>
                            <li><strong>Distribución:</strong> Los premios se distribuyen automáticamente según el grupo de cada participante</li>
                        </ol>
                    </div>
                </div>
            </section>

            <section className="how-it-works">
                <div className="container">
                    <h2 className="text-center mb-xl">¿Cómo Participar?</h2>
                    <div className="steps">
                        <div className="step card">
                            <div className="step-number">1</div>
                            <h3>Elige tu Sorteo</h3>
                            <p>Selecciona el sorteo que prefieras (2 a 500 USDT). Cada sorteo tiene diferente cantidad de ganadores.</p>
                        </div>
                        <div className="step card">
                            <div className="step-number">2</div>
                            <h3>Compra tu Cupo</h3>
                            <p>Paga el precio del sorteo elegido. Tu cupo queda registrado en blockchain.</p>
                        </div>
                        <div className="step card">
                            <div className="step-number">3</div>
                            <h3>Espera el Sorteo</h3>
                            <p>Cuando se llenan los cupos del sorteo (100 para sorteos 1-7, 60 para sorteos 8-9), el sorteo se dispara automáticamente con Chainlink VRF.</p>
                        </div>
                        <div className="step card">
                            <div className="step-number">4</div>
                            <h3>Chainlink Selecciona Grupos</h3>
                            <p>El sistema asigna aleatoriamente a cada participante a un grupo (A, B, C o D) de forma verificable.</p>
                        </div>
                        <div className="step card">
                            <div className="step-number">5</div>
                            <h3>Recibe tu Premio</h3>
                            <p>Según tu grupo, recibes el premio correspondiente. Incluso Grupo D recupera mínimo 52% de la entrada.</p>
                        </div>
                        <div className="step card">
                            <div className="step-number">6</div>
                            <h3>Participa de Nuevo</h3>
                            <p>Inmediatamente se abre un nuevo sorteo. Puedes participar cuantas veces quieras.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="trust-indicators">
                <div className="container">
                    <h2 className="text-center mb-xl">Indicadores de Confianza</h2>
                    <div className="indicators-grid">
                        <div className="indicator-card">
                            <div className="indicator-icon">🔍</div>
                            <h3>Contratos Verificados</h3>
                            <p>Código fuente público en opBNBScan</p>
                        </div>
                        <div className="indicator-card">
                            <div className="indicator-icon">📖</div>
                            <h3>Open Source</h3>
                            <p>Cualquiera puede auditar el código</p>
                        </div>
                        <div className="indicator-card">
                            <div className="indicator-icon">🧮</div>
                            <h3>Matemática Clara</h3>
                            <p>Fee 5% + Grupos A/B/C/D (35%+15%+5%+45%)</p>
                        </div>
                        <div className="indicator-card">
                            <div className="indicator-icon">🔐</div>
                            <h3>Chainlink VRF</h3>
                            <p>Selección de grupos verificable e inviolable</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="back-to-home-section" style={{ padding: '60px 20px', textAlign: 'center', background: 'rgba(0, 0, 0, 0.2)' }}>
                <div className="container">
                    <a href="/" style={{ display: 'inline-block', padding: '16px 40px', background: '#fbbf24', color: '#0f172a', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '1.1rem', transition: 'all 0.3s' }}>
                        ← Volver al Inicio
                    </a>
                </div>
            </section>

            <footer className="footer">
                <div className="container">
                    <p>PoolChain Raffles 2026 — Sistema Revolucionario de Múltiples Ganadores</p>
                    <p className="disclaimer">
                        No es una inversión. Es un sistema de sorteos con múltiples ganadores. Fee del 5% para mantenimiento y desarrollo. Participación voluntaria bajo tu propia responsabilidad. Solo para entretenimiento.
                    </p>
                </div>
            </footer>
        </div>
    )
}
