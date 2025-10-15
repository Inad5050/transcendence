import i18next from 'i18next';
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';

i18next.init(
{  
  fallbackLng: 'en', // El idioma a usar si las traducciones en el idioma actual no están disponibles
  debug: true,
  resources: 
  {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr }
  }
});

export default i18next;