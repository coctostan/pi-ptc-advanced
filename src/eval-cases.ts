export const EVAL_CASE_EXPECTED_FIRST_PATHS = ["code_execution", "direct"] as const;
export const EVAL_CASE_ACCEPTANCE_TYPES = ["exact", "structural", "behavioral"] as const;

export type EvalCaseExpectedFirstPath = (typeof EVAL_CASE_EXPECTED_FIRST_PATHS)[number];
export type EvalCaseAcceptanceType = (typeof EVAL_CASE_ACCEPTANCE_TYPES)[number];

export interface EvalCaseAcceptance {
  type: EvalCaseAcceptanceType;
  rules: string[];
}

export interface EvalCaseRecipeOutputContract {
  format: string;
  style: string;
  focus: string;
  max_items: number;
  max_chars?: number;
}

export interface EvalCaseRecipeTarget {
  repos: string[];
  workflow: string;
  summary: string;
  output_contract: EvalCaseRecipeOutputContract;
}

export interface EvalCase {
  id: string;
  prompt: string;
  expected_first_path: EvalCaseExpectedFirstPath;
  acceptance: EvalCaseAcceptance;
  recipe_target?: EvalCaseRecipeTarget;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isExpectedFirstPath(value: unknown): value is EvalCaseExpectedFirstPath {
  return typeof value === "string" && EVAL_CASE_EXPECTED_FIRST_PATHS.includes(value as EvalCaseExpectedFirstPath);
}

function isAcceptanceType(value: unknown): value is EvalCaseAcceptanceType {
  return typeof value === "string" && EVAL_CASE_ACCEPTANCE_TYPES.includes(value as EvalCaseAcceptanceType);
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

export function validateEvalCase(value: unknown): string[] {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return ["case must be an object"];
  }

  if (!isNonEmptyString(value.id)) {
    errors.push("id must be a non-empty string");
  }

  if (!isNonEmptyString(value.prompt)) {
    errors.push("prompt must be a non-empty string");
  }

  if (!isExpectedFirstPath(value.expected_first_path)) {
    errors.push('expected_first_path must be "code_execution" or "direct"');
  }

  if (!isRecord(value.acceptance)) {
    errors.push("acceptance must be an object");
    return errors;
  }

  if (!isAcceptanceType(value.acceptance.type)) {
    errors.push('acceptance.type must be "exact", "structural", or "behavioral"');
  }

  if (!Array.isArray(value.acceptance.rules)) {
    errors.push("acceptance.rules must be a non-empty array of strings");
    return errors;
  }

  if (value.acceptance.rules.length === 0) {
    errors.push("acceptance.rules must be a non-empty array of strings");
    return errors;
  }

  value.acceptance.rules.forEach((rule, index) => {
    if (!isNonEmptyString(rule)) {
      errors.push(`acceptance.rules[${index}] must be a non-empty string`);
    }
  });

  if (value.recipe_target === undefined) {
    return errors;
  }

  if (!isRecord(value.recipe_target)) {
    errors.push("recipe_target must be an object");
    return errors;
  }

  if (!Array.isArray(value.recipe_target.repos) || value.recipe_target.repos.length === 0) {
    errors.push("recipe_target.repos must be a non-empty array of strings");
  } else {
    value.recipe_target.repos.forEach((repo, index) => {
      if (!isNonEmptyString(repo)) {
        errors.push(`recipe_target.repos[${index}] must be a non-empty string`);
      }
    });
  }

  if (!isNonEmptyString(value.recipe_target.workflow)) {
    errors.push("recipe_target.workflow must be a non-empty string");
  }

  if (!isNonEmptyString(value.recipe_target.summary)) {
    errors.push("recipe_target.summary must be a non-empty string");
  }

  if (!isRecord(value.recipe_target.output_contract)) {
    errors.push("recipe_target.output_contract must be an object");
    return errors;
  }

  if (!isNonEmptyString(value.recipe_target.output_contract.format)) {
    errors.push("recipe_target.output_contract.format must be a non-empty string");
  }

  if (!isNonEmptyString(value.recipe_target.output_contract.style)) {
    errors.push("recipe_target.output_contract.style must be a non-empty string");
  }

  if (!isNonEmptyString(value.recipe_target.output_contract.focus)) {
    errors.push("recipe_target.output_contract.focus must be a non-empty string");
  }

  if (!isPositiveInteger(value.recipe_target.output_contract.max_items)) {
    errors.push("recipe_target.output_contract.max_items must be a positive integer");
  }

  if (
    value.recipe_target.output_contract.max_chars !== undefined
    && !isPositiveInteger(value.recipe_target.output_contract.max_chars)
  ) {
    errors.push("recipe_target.output_contract.max_chars must be a positive integer when provided");
  }

  return errors;
}

export function parseEvalCase(value: unknown, source = "eval case"): EvalCase {
  const errors = validateEvalCase(value);

  if (errors.length > 0) {
    throw new Error(`${source} validation failed: ${errors.join("; ")}`);
  }

  return value as EvalCase;
}
