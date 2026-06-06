import DefaultTheme from 'vitepress/theme'
import './styles.css'
import EspInstallButton from './components/EspInstallButton.vue'
import EspInstallSelector from './components/EspInstallSelector.vue'
import IconGallery from './components/IconGallery.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('EspInstallButton', EspInstallButton)
    app.component('EspInstallSelector', EspInstallSelector)
    app.component('IconGallery', IconGallery)
  },
}
