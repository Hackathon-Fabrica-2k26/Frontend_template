import { createVuetify } from 'vuetify'
import { pt } from 'vuetify/locale'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Tokens do DESIGN.md. Só existe tema claro; estados de erro/sucesso seguem o padrão do Vuetify
// até haver tokens semânticos aprovados.
// https://vuetifyjs.com/en/features/theme/
export default createVuetify({
  locale: { locale: 'pt', messages: { pt } },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          'primary': '#356B5B',
          'secondary': '#A9C7B4',
          'accent': '#E3B477',
          'background': '#F7F7F1',
          'surface': '#F7F7F1',
          'on-background': '#263D35',
          'on-surface': '#263D35',
          'on-primary': '#F7F7F1',
          'on-secondary': '#263D35',
        },
        variables: { 'border-color': '#A9C7B4', 'border-opacity': 1 },
      },
    },
  },
  defaults: {
    global: { style: 'text-transform: none;' },
    VBtn: { variant: 'flat', class: 'text-none font-weight-semibold', style: 'letter-spacing: 0;' },
    VCard: { variant: 'outlined', rounded: true },
    VTextField: { variant: 'outlined', color: 'primary', rounded: true },
    VSelect: { variant: 'outlined', color: 'primary', rounded: true },
    VTextarea: { variant: 'outlined', color: 'primary', rounded: true },
    VCheckbox: { color: 'primary' },
    VAppBar: { flat: true, color: 'background', border: 'b' },
    VNavigationDrawer: { color: 'background', border: 'e' },
  },
})
