import { useState } from 'react'
import './FAQ.css'

const faqs = [
    {
        question: '¿Qué es SAN Digital?',
        answer: 'Es un sistema de participación colectiva inspirado en el SAN tradicional, con reglas automáticas y transparentes ejecutadas por un contrato inteligente.\n\nNo es una inversión. No promete rentabilidad. Es participación voluntaria.'
    },
    {
        question: '¿Cómo funciona el aporte en cada tier?',
        answer: 'Cada tier tiene su propio monto de entrada (10, 20, 30, 40, 50 o 100 USDT).\n\nDistribución automática del aporte:\n• ~50% → Turno actual (quien está primero en la cola)\n• ~45% → Acumulación global (repartido entre todos los activos, incluido quien entra)\n• $1 → Gas del sistema (mantenimiento de interfaz y contratos)\n\nEjemplo Tier Standard (20 USDT):\n• 10 USDT → Turno\n• 9 USDT → Global\n• 1 USDT → Gas'
    },
    {
        question: '¿Cuánto tiempo tardo en alcanzar la salida (2x)?',
        answer: 'No hay tiempos garantizados.\n\nEl avance depende de cuántas personas participen después de ti. SAN Digital no promete plazos ni resultados.\n\nCada tier tiene su propio ritmo de participación.'
    },
    {
        question: '¿Qué pasa si nadie más entra?',
        answer: 'El sistema se pausa de forma natural.\n\nCada participante conserva su saldo acumulado y puede retirarlo cuando quiera usando claim().\n\nNadie pierde lo acumulado.\n\n**🌿 Sistema Landa™ - Protección Anti-Colapso:**\n\nA diferencia de sistemas tradicionales que colapsan con colas largas, el Sistema Landa usa dispersión progresiva:\n\n• Prioriza a quienes están más cerca del umbral\n• Mantiene flujo constante de usuarios listos para salir\n• Límite de 30 usuarios activos por tier (previene saturación)\n• Rotación natural sin expulsiones forzadas\n\n**Resultado:** Sistema matemáticamente sostenible que NO colapsa incluso con pausas temporales en nuevas entradas.'
    },
    {
        question: '¿Por qué no todos alcanzan la salida al mismo tiempo?',
        answer: 'SAN Digital funciona como un SAN tradicional: uno completa primero por orden de entrada (FIFO).\n\nLa diferencia es que aquí no esperas en cero, todos acumulan desde el inicio.\n\nCada tier opera de forma independiente con su propia cola.'
    },
    {
        question: '¿Puedo retirar lo acumulado en cualquier momento?',
        answer: 'Sí. Puedes usar claim() para retirar tu saldo acumulado cuando quieras.\n\nTu saldo no caduca, no se pierde, no se redistribuye. Es tuyo.'
    },
    {
        question: '¿Qué pasa cuando alguien alcanza la salida (2x)?',
        answer: 'Se marca como Finalizado, se elimina de la lista de activos, y el turno pasa automáticamente al siguiente usuario activo.\n\nYa no recibe más repartos globales, pero puede retirar su saldo mediante claim().'
    },
    {
        question: '¿Es una inversión?',
        answer: 'No.\n\nSAN Digital es un sistema de participación colectiva, no una inversión.\n\nNo promete rentabilidad. La participación es completamente voluntaria.\n\nCada participante entra bajo su propia responsabilidad.'
    },
    {
        question: '¿Tengo que buscar o convencer a otras personas para participar?',
        answer: '**No. Absolutamente no.**\n\nSAN Digital funciona de forma **completamente automática** mediante una cola global (FIFO: First In, First Out).\n\n**Cómo funciona:**\n• Entras → Te unes a la cola automáticamente según tu orden de llegada\n• Cada nueva entrada beneficia a TODOS los participantes activos\n• El sistema prioriza automáticamente al primero en la cola (turno)\n• **No necesitas reclutar, promover ni convencer a nadie**\n\n**Todos apoyan a todos**, especialmente al que está en el turno de salida.\n\nEs un sistema de ahorro rotativo automatizado, no un esquema de reclutamiento.'
    },
    {
        question: '¿Cuántas personas se necesitan para completar mi ciclo?',
        answer: 'No hay un número fijo.\n\nEl avance depende del ritmo de participación global del tier en el que estás, no de tu esfuerzo individual.\n\n**Importante:**\n• Entras en una cola automática según orden de llegada\n• Cada nueva entrada distribuye: ~50% al turno + ~45% global + $1 gas\n• Todos acumulan progresivamente desde el inicio\n• El sistema avanza de forma natural y orgánica\n\nSAN Digital **no garantiza tiempos ni resultados**. Es participación voluntaria.'
    },
    {
        question: '¿Puedo participar más de una vez?',
        answer: 'Sí. Puedes crear múltiples posiciones simultáneas sin límite, en el mismo tier o en diferentes tiers.\n\nCada posición es independiente y acumula su propio saldo.\n\nCuando una posición alcanza la salida (2x), sale automáticamente y puedes crear otra si quieres.\n\nNo hay restricciones en el número de posiciones que puedes tener activas.'
    },
    {
        question: '¿Qué es el gas del sistema?',
        answer: 'El $1 de cada entrada (sin importar el tier) se acumula en el contrato para cubrir:\n\n• Costes de despliegue y desarrollo\n• Mantenimiento técnico de la interfaz\n• Actualizaciones del sistema\n• Operación de los contratos en la red\n\nEste fondo es retirable por el administrador mediante ownerWithdraw().'
    },
    {
        question: '🚨 ¿Qué son los "fondos atrapados" y cómo los rescato?',
        answer: '**¿Qué son?**\n\nEn casos extremadamente raros (<0.1%), un pago automático puede fallar (por ejemplo, si tu wallet rechaza el transfer por alguna configuración especial).\n\nCuando esto ocurre, tus fondos NO se pierden. Se guardan de forma segura en `pendingWithdrawals` dentro del contrato.\n\n**¿Cómo los rescato?**\n\nSi tienes fondos atrapados, verás automáticamente un **botón rojo de emergencia** en tu dashboard:\n\n🚨 Fondos Atrapados Detectados\nTienes X USDT que no pudieron transferirse\n[🆘 Rescatar X USDT]\n\nSimplemente haz clic en el botón y tus fondos se transferirán de forma segura a tu wallet.\n\n**¿Es seguro?**\n\nSí, completamente. **Solo tú** puedes rescatar tus fondos. El administrador NO tiene acceso a ellos.\n\nEsta es una función de SEGURIDAD para protegerte, no una "puerta trasera".\n\n**¿Por qué existe esto?**\n\nEs una práctica estándar en DeFi (usada por Aave, Compound, MasterChef) para garantizar que nunca pierdas fondos por fallos técnicos.'
    }
]

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null)

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="faq-section">
            <div className="container">
                <h2 className="text-center mb-xl">Preguntas Frecuentes</h2>
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`faq-item card ${openIndex === index ? 'open' : ''}`}
                        >
                            <button
                                className="faq-question"
                                onClick={() => toggleFAQ(index)}
                            >
                                <span>{faq.question}</span>
                                <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
                            </button>
                            {openIndex === index && (
                                <div className="faq-answer">
                                    {faq.answer.split('\n').map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
