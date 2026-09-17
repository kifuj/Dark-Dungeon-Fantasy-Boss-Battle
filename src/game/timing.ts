/**
 * Un tour animé dure moins de 4 s (US-09 CA4). Au-delà, la page considère la scène en échec
 * (pas encore chargée, canvas en erreur, onglet en arrière-plan) et applique le tour quand même.
 */
export const ANIMATION_TIMEOUT_MS = 4500;
