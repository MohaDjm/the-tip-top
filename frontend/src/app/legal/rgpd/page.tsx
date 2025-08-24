export default function RGPDPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="font-['Playfair_Display'] text-4xl font-bold text-[#2C5545] mb-8 text-center">
          Politique de Confidentialité RGPD
        </h1>

        <div className="space-y-8">
          {/* Introduction */}
          <section className="mb-12">
            <p className="font-['Lato'] text-gray-700 leading-relaxed">
              Thé Tip Top SAS s&apos;engage à protéger la confidentialité de vos données personnelles 
              conformément au Règlement Général sur la Protection des Données (RGPD) et à la 
              loi Informatique et Libertés.
            </p>
          </section>

          {/* Data Controller */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              1. Responsable du traitement
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-2">
              <p><strong>Thé Tip Top SAS</strong></p>
              <p>18 rue Léon Frot, 75011 Paris</p>
              <p>RCS Paris : 123 456 789</p>
              <p>Email : dpo@thetiptop.fr</p>
            </div>
          </section>

          {/* Data Collection */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              2. Données collectées
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-4">
              <h3 className="font-semibold text-[#2C5545] text-lg">Données d&apos;identification</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone</li>
                <li>Date de naissance</li>
                <li>Adresse postale</li>
              </ul>

              <h3 className="font-semibold text-[#2C5545] text-lg">Données de connexion</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Adresse IP</li>
                <li>Données de navigation (cookies)</li>
                <li>Historique des participations</li>
                <li>Préférences utilisateur</li>
              </ul>
            </div>
          </section>

          {/* Purpose of Processing */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              3. Finalités du traitement
            </h2>
            <div className="font-['Lato'] text-gray-700">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Gestion de votre participation au jeu-concours</li>
                <li>Attribution et remise des gains</li>
                <li>Communication marketing (avec votre consentement)</li>
                <li>Amélioration de nos services</li>
                <li>Respect des obligations légales</li>
                <li>Prévention de la fraude</li>
              </ul>
            </div>
          </section>

          {/* Legal Basis */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              4. Base légale du traitement
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-4">
              <p><strong>Exécution contractuelle :</strong> Gestion de votre participation au jeu-concours</p>
              <p><strong>Consentement :</strong> Communications marketing et cookies non essentiels</p>
              <p><strong>Intérêt légitime :</strong> Amélioration des services et prévention de la fraude</p>
              <p><strong>Obligation légale :</strong> Conservation des données comptables et fiscales</p>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              5. Partage des données
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-4">
              <p>Vos données peuvent être partagées avec :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Nos prestataires techniques (hébergement, maintenance)</li>
                <li>Nos partenaires logistiques pour la livraison des gains</li>
                <li>Les autorités compétentes si requis par la loi</li>
                <li>L&apos;huissier de justice pour la validation du jeu-concours</li>
              </ul>
              <p className="mt-4">
                Tous nos partenaires sont soumis à des obligations de confidentialité 
                et ne peuvent utiliser vos données que pour les finalités définies.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              6. Durée de conservation
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-4">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Données de participation :</strong> 3 ans après la fin du jeu-concours</li>
                <li><strong>Données marketing :</strong> 3 ans après le dernier contact</li>
                <li><strong>Données comptables :</strong> 10 ans (obligation légale)</li>
                <li><strong>Cookies :</strong> 13 mois maximum</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              7. Vos droits
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-4">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Droit d&apos;accès :</strong> Connaître les données que nous détenons sur vous</li>
                <li><strong>Droit de rectification :</strong> Corriger vos données inexactes</li>
                <li><strong>Droit à l&apos;effacement :</strong> Supprimer vos données sous conditions</li>
                <li><strong>Droit à la limitation :</strong> Limiter le traitement de vos données</li>
                <li><strong>Droit à la portabilité :</strong> Récupérer vos données dans un format structuré</li>
                <li><strong>Droit d&apos;opposition :</strong> Vous opposer au traitement pour motif légitime</li>
                <li><strong>Droit de retrait du consentement :</strong> Retirer votre consentement à tout moment</li>
              </ul>
              <p className="mt-4">
                Pour exercer ces droits, contactez-nous à : dpo@thetiptop.fr
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              8. Cookies et traceurs
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-4">
              <h3 className="font-semibold text-[#2C5545] text-lg">Cookies essentiels</h3>
              <p>Nécessaires au fonctionnement du site (authentification, sécurité)</p>

              <h3 className="font-semibold text-[#2C5545] text-lg">Cookies analytiques</h3>
              <p>Nous aident à comprendre l&apos;utilisation du site (avec votre consentement)</p>

              <h3 className="font-semibold text-[#2C5545] text-lg">Cookies marketing</h3>
              <p>Personnalisation des contenus et publicités (avec votre consentement)</p>

              <p className="mt-4">
                Vous pouvez gérer vos préférences de cookies via notre bandeau de consentement 
                ou les paramètres de votre navigateur.
              </p>
            </div>
          </section>

          {/* Security */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              9. Sécurité des données
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-4">
              <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Chiffrement des données sensibles</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Surveillance et journalisation des accès</li>
                <li>Sauvegardes régulières et sécurisées</li>
                <li>Formation du personnel à la protection des données</li>
              </ul>
            </div>
          </section>

          {/* International Transfers */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              10. Transferts internationaux
            </h2>
            <p className="font-['Lato'] text-gray-700 leading-relaxed">
              Vos données sont hébergées au sein de l&apos;Union Européenne. En cas de transfert 
              vers un pays tiers, nous nous assurons d&apos;un niveau de protection adéquat 
              (décision d&apos;adéquation, clauses contractuelles types, etc.).
            </p>
          </section>

          {/* Complaints */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              11. Réclamations
            </h2>
            <p className="font-['Lato'] text-gray-700 leading-relaxed">
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire 
              une réclamation auprès de la Commission Nationale de l&apos;Informatique et des 
              Libertés (CNIL) : www.cnil.fr
            </p>
          </section>

          {/* Updates */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              12. Modifications
            </h2>
            <p className="font-['Lato'] text-gray-700 leading-relaxed">
              Cette politique de confidentialité peut être modifiée. La version en vigueur 
              est celle publiée sur notre site web. Dernière mise à jour : 1er janvier 2024.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              13. Contact
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-2">
              <p><strong>Délégué à la Protection des Données (DPO)</strong></p>
              <p>Email : dpo@thetiptop.fr</p>
              <p>Adresse : 18 rue Léon Frot, 75011 Paris</p>
              <p>Téléphone : +33 1 23 45 67 89</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
