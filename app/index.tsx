import { fr } from "@codegouvfr/react-dsfr";
import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Simulateur from "./lib/Simulateur";

startReactDsfr({ defaultColorScheme: "system", Link });

declare module "@codegouvfr/react-dsfr/spa" {
  interface RegisterLink {
    Link: typeof Link;
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </React.StrictMode>
);

function Root() {
  return (
    <>
      <div
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Header
          brandTop={
            <>
              INTITULE
              <br />
              OFFICIEL
            </>
          }
          serviceTitle="Simulateur coût immatriculation"
          homeLinkProps={{
            to: "/",
            title:
              "Accueil - Nom de l’entité (ministère, secrétariat d‘état, gouvernement)",
          }}
        />
        <div
          style={{
            flex: 1,
            margin: "auto",
            maxWidth: 1000,
            ...fr.spacing("padding", { topBottom: "10v" }),
          }}
        >
          <Routes>
            <Route path="/" element={<Simulateur />} />
            <Route path="*" element={<h1>404</h1>} />
          </Routes>
        </div>
        <Footer
          accessibility="fully compliant"
          contentDescription={`
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
                        incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
                        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
                        eu fugiat nulla pariatur. 
                    `}
          bottomItems={[headerFooterDisplayItem]}
        />
      </div>
    </>
  );
}
