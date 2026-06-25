export function checkPasswordStrength(password: string) {
  const rules = {
    length: password.length >= 6,
    number: /\d/.test(password),
    letter: /[a-zA-Z]/.test(password),
    strongLength: password.length >= 10,
  };

  const score = Object.values(rules).filter(Boolean).length;

  let label = "Weak";

  if (score >= 3) label = "Medium";
  if (score >= 4) label = "Strong";

  return {
    score,
    label,
    rules,
  };
}
