export const commonStyles = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-16 lg:py-24',
  heading: {
    h1: 'text-4xl tracking-tight font-bold text-slate-900 dark:text-white sm:text-5xl md:text-6xl',
    h2: 'text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl',
    h3: 'text-xl font-semibold text-slate-900 dark:text-white',
  },
  text: {
    primary: 'text-slate-900 dark:text-white',
    secondary: 'text-slate-600 dark:text-slate-300',
    accent: 'text-emerald-600 dark:text-emerald-400',
  },
  button: {
    primary:
      'inline-flex items-center justify-center px-5 py-3 rounded-lg bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 hover:shadow-xl transition-all duration-200',
    secondary:
      'inline-flex items-center justify-center px-5 py-3 rounded-lg bg-slate-800 text-white shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-200',
    outline:
      'inline-flex items-center justify-center px-5 py-3 rounded-lg bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 transition-all duration-200',
  },
  card: {
    base: 'bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden',
    hover: 'hover:shadow-xl transition-all duration-200',
    header: 'px-6 py-4 border-b border-slate-100 dark:border-slate-700',
    body: 'px-6 py-4',
    footer: 'px-6 py-4 bg-slate-50 dark:bg-slate-700/50',
  },
  grid: {
    base: 'grid gap-6 sm:gap-8',
    cols2: 'grid-cols-1 sm:grid-cols-2',
    cols3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  },
  form: {
    input:
      'block w-full rounded-lg border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white',
    label: 'block text-sm font-medium text-slate-700 dark:text-slate-300',
    error: 'mt-1 text-sm text-red-600 dark:text-red-400',
  },
};
