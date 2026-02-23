import { useLanguageStore, type Lang } from "./store/languageStore";

const translations = {
  es: {
    // ── Hero ──────────────────────────────────────────────────────────────
    "hero.headline":    "La Barbería.<br /><em>Elevada.</em>",
    "hero.subline":     "Reserve su cita en segundos.",
    "hero.cta1":        "Reservar Ahora",
    "hero.cta2":        "Explorar",

    // ── Header / Desktop nav ──────────────────────────────────────────────
    "nav.services":     "Servicios",
    "nav.team":         "Equipo",
    "nav.studio":       "Studio",
    "nav.shop":         "Shop",
    "nav.signin":       "Ingresar",
    "nav.book":         "Reservar",
    "nav.dashboard":    "Panel",
    "nav.wallet":       "Billetera",
    "nav.logout":       "Salir",

    // ── Mobile menu ───────────────────────────────────────────────────────
    "menu.yourBooking": "Tu Reserva",
    "menu.with":        "con",
    "menu.bookNow":     "Reservar Ahora",
    "menu.signin":      "Iniciar Sesión",
    "menu.myProfile":   "Mi Perfil",
    "menu.location":    "Downtown Studio",
    "menu.logout":      "Cerrar Sesión",

    // ── Footer ────────────────────────────────────────────────────────────
    "footer.tagline":      "Gracias por elegir Vantage. Estamos aquí para brindarte la mejor experiencia de barbería, adaptada a tu estilo. Visítanos hoy para un look fresco y con confianza.",
    "footer.contact":      "Contacto",
    "footer.links":        "Links",
    "footer.social":       "Síguenos",
    "footer.rights":       "Todos los derechos reservados.",
    "footer.nav.home":     "Inicio",
    "footer.nav.services": "Servicios",
    "footer.nav.team":     "Equipo",
    "footer.nav.gallery":  "Galería",
    "footer.nav.contact":  "Contacto",

    // ── Login ─────────────────────────────────────────────────────────────
    "login.welcome":   "Bienvenido",
    "login.subtitle":  "Ingresa a tu cuenta para continuar",
    "login.email":     "Correo Electrónico",
    "login.password":  "Contraseña",
    "login.submit":    "Iniciar Sesión",
    "login.noAccount": "¿No tienes cuenta?",
    "login.register":  "Regístrate",
    "login.error":     "Credenciales incorrectas",
    "login.tagline":   "La experiencia premium en barbería",

    // ── Register ──────────────────────────────────────────────────────────
    "register.title":       "Crear Cuenta",
    "register.subtitle":    "Únete a la experiencia Vantage",
    "register.accountType": "Tipo de cuenta",
    "register.customer":    "Cliente",
    "register.barber":      "Barbero",
    "register.fullName":    "Nombre Completo",
    "register.email":       "Correo Electrónico",
    "register.password":    "Contraseña (mínimo 8 caracteres)",
    "register.submit":      "Crear Cuenta",
    "register.hasAccount":  "¿Ya tienes cuenta?",
    "register.login":       "Iniciar Sesión",
    "register.error":       "Error al crear la cuenta",
    "register.tagline":     "Donde el estilo se convierte en arte",
    "register.minPassword": "La contraseña debe tener al menos 8 caracteres",

    // ── Barber team ───────────────────────────────────────────────────────
    "team.masterBarber":     "Maestro Barbero",
    "team.seniorStylist":    "Estilista Senior",
    "team.creativeDirector": "Director Creativo",
    "team.years":            "años de experiencia",
    "team.bookBarber":       "Reservar con",

    // ── AI Concierge ──────────────────────────────────────────────────────
    "ai.greeting":    "Hola, soy tu Concierge.\n¿En qué puedo ayudarte hoy?",
    "ai.placeholder": "Escribe tu consulta...",
    "ai.footer":      "Concierge IA · Vantage Platform",
    "ai.support":     "Soporte VIP · WhatsApp",
    "ai.error":       "Hubo un error de conexión. Por favor, intenta nuevamente.",
    "ai.fallback":    "Lo siento, no pude procesar tu consulta. Inténtalo de nuevo.",
  },

  en: {
    // ── Hero ──────────────────────────────────────────────────────────────
    "hero.headline":    "The Barbershop.<br /><em>Elevated.</em>",
    "hero.subline":     "Book your appointment in seconds.",
    "hero.cta1":        "Book Now",
    "hero.cta2":        "Explore",

    // ── Header / Desktop nav ──────────────────────────────────────────────
    "nav.services":     "Services",
    "nav.team":         "Team",
    "nav.studio":       "Studio",
    "nav.shop":         "Shop",
    "nav.signin":       "Sign In",
    "nav.book":         "Book",
    "nav.dashboard":    "Dashboard",
    "nav.wallet":       "Wallet",
    "nav.logout":       "Log Out",

    // ── Mobile menu ───────────────────────────────────────────────────────
    "menu.yourBooking": "Your Booking",
    "menu.with":        "with",
    "menu.bookNow":     "Book Now",
    "menu.signin":      "Sign In",
    "menu.myProfile":   "My Profile",
    "menu.location":    "Downtown Studio",
    "menu.logout":      "Log Out",

    // ── Footer ────────────────────────────────────────────────────────────
    "footer.tagline":      "Thank you for choosing Vantage. We are here to provide you with the best barbershop experience, tailored to your style. Visit us today for a fresh look with confidence.",
    "footer.contact":      "Contact",
    "footer.links":        "Links",
    "footer.social":       "Follow Us",
    "footer.rights":       "All rights reserved.",
    "footer.nav.home":     "Home",
    "footer.nav.services": "Services",
    "footer.nav.team":     "Team",
    "footer.nav.gallery":  "Gallery",
    "footer.nav.contact":  "Contact",

    // ── Login ─────────────────────────────────────────────────────────────
    "login.welcome":   "Welcome",
    "login.subtitle":  "Sign in to your account to continue",
    "login.email":     "Email Address",
    "login.password":  "Password",
    "login.submit":    "Sign In",
    "login.noAccount": "Don't have an account?",
    "login.register":  "Sign Up",
    "login.error":     "Invalid credentials",
    "login.tagline":   "The premium barbershop experience",

    // ── Register ──────────────────────────────────────────────────────────
    "register.title":       "Create Account",
    "register.subtitle":    "Join the Vantage experience",
    "register.accountType": "Account type",
    "register.customer":    "Customer",
    "register.barber":      "Barber",
    "register.fullName":    "Full Name",
    "register.email":       "Email Address",
    "register.password":    "Password (minimum 8 characters)",
    "register.submit":      "Create Account",
    "register.hasAccount":  "Already have an account?",
    "register.login":       "Sign In",
    "register.error":       "Error creating account",
    "register.tagline":     "Where style becomes art",
    "register.minPassword": "Password must be at least 8 characters",

    // ── Barber team ───────────────────────────────────────────────────────
    "team.masterBarber":     "Master Barber",
    "team.seniorStylist":    "Senior Stylist",
    "team.creativeDirector": "Creative Director",
    "team.years":            "years of experience",
    "team.bookBarber":       "Book with",

    // ── AI Concierge ──────────────────────────────────────────────────────
    "ai.greeting":    "Hi, I'm your Concierge.\nHow can I help you today?",
    "ai.placeholder": "Type your question...",
    "ai.footer":      "AI Concierge · Vantage Platform",
    "ai.support":     "VIP Support · WhatsApp",
    "ai.error":       "Connection error. Please try again.",
    "ai.fallback":    "Sorry, I couldn't process your request. Please try again.",
  },
} as const;

type TranslationKey = keyof typeof translations.es;

/** React hook — use inside components */
export function useT() {
  const lang = useLanguageStore((s) => s.lang);
  return (key: TranslationKey): string =>
    (translations[lang] as Record<string, string>)[key] ?? key;
}

/** Plain function — use outside React (e.g. static data arrays) */
export function t(lang: Lang, key: TranslationKey): string {
  return (translations[lang] as Record<string, string>)[key] ?? key;
}
