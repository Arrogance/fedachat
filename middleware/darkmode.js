export default function(context) {
  if (context.app.$storage.get('darkMode', false)) {
    document.getElementsByTagName('body')[0].classList.add('dark')
  }
}
