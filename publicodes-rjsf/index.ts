import { UiSchema, type RJSFSchema } from "@rjsf/utils";
import Engine, {
  reduceAST,
  type ASTNode,
  type EvaluatedNode,
  type RuleNode,
} from "publicodes";

export default function generateSchemas<RuleNames extends string>(
  engine: Engine<RuleNames>,
  goals: Array<RuleNames>
): [schema: RJSFSchema, ui: UiSchema] {
  const evaluatedGoals = goals.map((goal) => engine.evaluate(goal));
  const fieldsSchemas = Object.entries(mergeAllMissing(evaluatedGoals))
    .sort(([, a], [, b]) => b - a)
    .filter(
      ([name]) =>
        engine.evaluate({ "est non applicable": name }).nodeValue !== true
    )
    .map(([name]) => [name, ruleToSchema(name, engine)]);

  return [
    {
      type: "object",
      title: "Simulation",
      properties: Object.fromEntries(
        fieldsSchemas.map(([name, schema]) => [name, schema[0]])
      ),
    },

    Object.fromEntries(
      fieldsSchemas.map(([name, schema]) => [name, schema[1]])
    ),
  ];
}

function ruleToSchema<RuleNames extends string>(
  ruleName: RuleNames,
  engine: Engine<RuleNames>
): [RJSFSchema, UiSchema] {
  const rule = engine.getRule(ruleName);
  console.log(ruleName, engine.baseContext.nodesTypes.get(rule));
  const type = engine.context.nodesTypes.get(rule)?.type;

  if (isOnePossibility(rule)) {
    const possibilities = getOnePossibilityOptions(engine, ruleName).children;
    return [
      {
        type: "string",
        title: rule.rawNode.question,
        description: rule.rawNode.description,
        enum: possibilities.map((rule) => `'${rule.dottedName}'`),
      },
      {
        "ui:widget": rule.rawNode.formulaire?.type,
        "ui:enumNames": possibilities.map((rule) => rule.title),
      },
    ];
  }

  return [
    {
      type: type === "date" ? "string" : type ?? "boolean",
      title: rule.rawNode.question ?? rule.title,
      description: rule.rawNode.description,
      format: type === "date" ? "date" : undefined,
    },
    {},
  ];
}

const mergeMissing = (
  left: Record<string, number> | undefined = {},
  right: Record<string, number> | undefined = {}
): Record<string, number> =>
  Object.fromEntries(
    [...Object.keys(left), ...Object.keys(right)].map((key) => [
      key,
      (left[key] ?? 0) + (right[key] ?? 0),
    ])
  );

const mergeAllMissing = (missings: Array<EvaluatedNode | ASTNode>) =>
  missings.map(collectNodeMissing).reduce(mergeMissing, {});

const collectNodeMissing = (
  node: EvaluatedNode | ASTNode
): Record<string, number> =>
  "missingVariables" in node ? node.missingVariables : {};

const isOnePossibility = (node: RuleNode) =>
  reduceAST<false | (ASTNode & { nodeKind: "une possibilité" })>(
    (_, node) => {
      if (node.nodeKind === "une possibilité") {
        return node;
      }
    },
    false,
    node
  );

export const getOnePossibilityOptions = <Name extends string>(
  engine: Engine<Name>,
  path: Name
): Choice => {
  const node = engine.getRule(path);
  if (!node) {
    throw new Error(`La règle ${path} est introuvable`);
  }
  const variant = isOnePossibility(node);
  const canGiveUp =
    variant &&
    (!variant["choix obligatoire"] || variant["choix obligatoire"] === "non");

  return Object.assign(
    node,
    variant
      ? {
          canGiveUp,
          children: (
            variant.explanation as (ASTNode & {
              nodeKind: "reference";
            })[]
          )
            .filter(
              (explanation) => engine.evaluate(explanation).nodeValue !== null
            )
            .map(({ dottedName }) =>
              getOnePossibilityOptions(engine, dottedName as Name)
            ),
        }
      : null
  );
};

export type Choice = ASTNode<"rule"> & {
  children: Array<ASTNode<"rule"> | Choice>;
  canGiveUp?: boolean;
};

/*

## TODOS

- [ ] Export mergeMissing and mergeAllMissing from publicodes
- [ ] Export une possibilité utilites from publicodes
- [ ] Check the perf of mergeMissing and mergeAllMissing (maybe can be optimized to improve evaluation time)


## Ideas
- `getValue`, `getMissingVariables` and `getUnit` methods on `Engine`

*/
