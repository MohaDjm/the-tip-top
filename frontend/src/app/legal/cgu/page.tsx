'use client';

export default function CGUPage() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-8 md:p-12">
      <h1 className="font-['Playfair_Display'] text-4xl font-bold text-[#2C5545] mb-8">
        Conditions Générales d'Utilisation
      </h1>
      <p className="text-sm text-gray-600 mb-6 font-['Lato']">En vigueur au 01/01/2024</p>

      <article className="space-y-8 font-['Lato']">
        <section>
          <h2 className="text-2xl font-bold text-[#2C5545] mb-4 font-['Playfair_Display']">Article 1 - Objet</h2>
          <p className="text-gray-700 leading-relaxed">
            Les présentes CGU régissent l'utilisation du site de jeu-concours Thé Tip Top 
            accessible à l'adresse www.thetiptop.fr. En accédant au site, l'utilisateur 
            accepte sans réserve les présentes conditions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#2C5545] mb-4 font-['Playfair_Display']">Article 2 - Conditions de participation</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            La participation au jeu-concours est ouverte à toute personne physique majeure 
            résidant en France métropolitaine, à l'exclusion du personnel de Thé Tip Top 
            et de leurs familles.
          </p>
          <p className="text-gray-700 leading-relaxed mb-3">La participation nécessite :</p>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-2 text-gray-700">
            <li>Un achat minimum de 49€ TTC en boutique Thé Tip Top</li>
            <li>La création d'un compte sur le site</li>
            <li>La saisie d'un code valide de 10 caractères</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#2C5545] mb-4 font-['Playfair_Display']">Article 3 - Inscription et compte utilisateur</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            L'inscription est gratuite et obligatoire pour participer. L'utilisateur s'engage 
            à fournir des informations exactes et à les maintenir à jour.
          </p>
          <div className="bg-[#F5F1E6] border-l-4 border-[#D4B254] p-4 rounded">
            <p className="font-bold text-[#2C5545] mb-2">Important :</p>
            <p className="text-[#2C5545]">
              Toute fausse déclaration entraînera l'annulation immédiate de la participation 
              et des gains éventuels.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#2C5545] mb-4 font-['Playfair_Display']">Article 4 - Protection des données personnelles</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Conformément au RGPD, Thé Tip Top s'engage à protéger les données personnelles 
            des utilisateurs. Les données collectées sont :
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
            <li>Nom, prénom, date de naissance</li>
            <li>Adresse email et postale</li>
            <li>Numéro de téléphone</li>
            <li>Historique des participations</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            Ces données sont utilisées uniquement dans le cadre du jeu-concours et pour 
            l'envoi d'informations commerciales (avec consentement).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#2C5545] mb-4 font-['Playfair_Display']">Article 5 - Cookies</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Le site utilise des cookies pour améliorer l'expérience utilisateur :
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
            <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
            <li><strong>Cookies analytiques :</strong> Google Analytics (avec anonymisation IP)</li>
            <li><strong>Cookies de préférences :</strong> pour mémoriser vos choix</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#2C5545] mb-4 font-['Playfair_Display']">Article 6 - Gains et réclamation</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Les gains doivent être réclamés dans un délai de 60 jours suivant la participation. 
            Passé ce délai, les gains sont définitivement perdus.
          </p>
          <p className="text-gray-700 leading-relaxed">
            La remise des gains s'effectue uniquement dans les boutiques Thé Tip Top, 
            sur présentation d'une pièce d'identité et du QR code de validation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#2C5545] mb-4 font-['Playfair_Display']">Article 7 - Responsabilité</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Thé Tip Top ne saurait être tenu responsable :
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
            <li>Des dysfonctionnements techniques du site</li>
            <li>De la perte de codes de participation</li>
            <li>Des erreurs de saisie de l'utilisateur</li>
            <li>De l'utilisation frauduleuse d'un compte</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#2C5545] mb-4 font-['Playfair_Display']">Article 8 - Modification des CGU</h2>
          <p className="text-gray-700 leading-relaxed">
            Thé Tip Top se réserve le droit de modifier les présentes CGU à tout moment. 
            Les utilisateurs seront informés par email de toute modification substantielle.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#2C5545] mb-4 font-['Playfair_Display']">Article 9 - Loi applicable</h2>
          <p className="text-gray-700 leading-relaxed">
            Les présentes CGU sont soumises au droit français. Tout litige sera soumis 
            aux tribunaux compétents de Paris.
          </p>
        </section>

        <section className="bg-[#F5F1E6] p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-[#2C5545] mb-4 font-['Playfair_Display']">Contact</h2>
          <p className="text-gray-700">
            Pour toute question concernant ces conditions d'utilisation :<br />
            <strong>Email :</strong> legal@thetiptop.fr<br />
            <strong>Adresse :</strong> Thé Tip Top, 18 rue Léon Frot, 75011 Paris
          </p>
        </section>
      </article>
    </div>
  )
}
