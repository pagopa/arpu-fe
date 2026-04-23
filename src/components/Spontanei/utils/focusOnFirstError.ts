/**
 * Focuses on the first form field that has a validation error,
 * following the visual order in the DOM rather than the
 * alphabetical or insertion order of the error object keys.
 *
 * @param errors - Formik errors object (e.g., { email: 'Invalid', firstName: 'Required' })
 */
const focusOnFirstError = (errors: Record<string, unknown>): void => {
  if (!errors || Object.keys(errors).length === 0) return;

  // 1. Select all potential input fields in the order they appear in the DOM
  const selectors = 'input, select, textarea, [role="combobox"]';
  const elements = Array.from(document.querySelectorAll(selectors)) as HTMLElement[];

  // 2. Find the first element whose 'name' or 'id' matches a key in the errors object
  const firstInvalidElement = elements.find((element) => {
    const name = element.getAttribute('name');
    const id = element.id;

    // Check if either the 'name' or 'id' exists as a key in the errors object.
    // This also works for nested fields if the name attribute matches the error key (e.g., "address.city")
    return (name && errors[name]) || (id && errors[id]);
  });

  // 3. If a match is found, apply focus and ensure it is visible
  if (firstInvalidElement) {
    firstInvalidElement.focus();
  }
};

export default focusOnFirstError;
