import modele from ":/modele";
import generateSchemas from ":/publicodes-rjsf";
import FormDSFR from ":/rjsf-dsfr";
import { customizeValidator } from "@rjsf/validator-ajv8";
import frenchLocalizer from "ajv-i18n/localize/fr";
import Engine from "publicodes";

const validator = customizeValidator({}, frenchLocalizer);

export default function Simulateur() {
  const engine = new Engine(modele);
  const schema = generateSchemas(engine, ["cout certificat immatriculation"]);
  return (
    <div>
      <h1>Simulateur</h1>
      <p>
        Prototype de simulateur généré automatiquement à partir d’un modèle
        publicodes.
      </p>
      <FormDSFR schema={schema[0]} validator={validator} uiSchema={schema[1]} />
    </div>
  );
}
