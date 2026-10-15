import { createVuetify } from 'vuetify'
import { pt } from 'vuetify/locale'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// https://vuetifyjs.com/en/features/theme/
export default createVuetify({
  locale: { locale: 'pt', messages: { pt } },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: { primary: '#1F8BDD' },
      },
      dark: {
        dark: true,
        colors: { primary: '#4DA3E8', background: '#0F1419', surface: '#182029' },
      },
    },
  },
  defaults: {
    global: { style: 'text-transform: none;' },
  },
})
