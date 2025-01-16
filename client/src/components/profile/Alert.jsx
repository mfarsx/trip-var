export function Alert({ type, message }) {
  if (!message) return null;

  const styles = {
    error: {
      wrapper: "bg-red-50 dark:bg-red-900/50",
      text: "text-red-700 dark:text-red-200",
    },
    success: {
      wrapper: "bg-green-50 dark:bg-green-900/50",
      text: "text-green-700 dark:text-green-200",
    },
  };

  const style = styles[type] || styles.error;

  return (
    <div className={`mb-4 rounded-md ${style.wrapper} p-4`}>
      <div className={`text-sm ${style.text}`}>{message}</div>
    </div>
  );
}
