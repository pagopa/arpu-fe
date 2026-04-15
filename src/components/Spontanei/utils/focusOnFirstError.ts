/**
 * Focuses on the first form field that has a validation error.
 * Uses the error keys to find the corresponding input element by id.
 * This improves accessibility by directing keyboard/screen reader focus
 * to the first invalid field on form submission.
 *
 * @param errors - An object where keys are field names and values are error messages.
 */
const focusOnFirstError = (errors: Record<string, string>) => {
  const firstErrorKey = Object.keys(errors)[0];
  if (firstErrorKey) {
    const element = document.getElementById(firstErrorKey);
    if (element) {
      element.focus();
    }
  }
};

export default focusOnFirstError;
