'use client';

import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E6]">
      {/* Header */}
      <div className="bg-[#2C5545] text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-center mb-4">
            Mentions Légales
          </h1>
          <p className="font-['Lato'] text-lg text-center text-white/80">
            Informations légales et conditions d&apos;utilisation
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-8 md:p-12">
          
          {/* Company Information */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              Informations sur l&apos;entreprise
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-4">
              <p><strong>Raison sociale :</strong> Thé Tip Top SAS</p>
              <p><strong>Siège social :</strong> 18 rue Léon Frot, 75011 Paris, France</p>
              <p><strong>SIRET :</strong> 123 456 789 00012</p>
              <p><strong>RCS :</strong> Paris B 123 456 789</p>
              <p><strong>Capital social :</strong> 50 000 €</p>
              <p><strong>TVA intracommunautaire :</strong> FR12 123456789</p>
              <p><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
              <p><strong>Email :</strong> contact@thetiptop.fr</p>
            </div>
          </section>

          {/* Director of Publication */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              Directeur de la publication
            </h2>
            <div className="font-['Lato'] text-gray-700">
              <p>Monsieur Jean-Pierre Dubois, Président de Thé Tip Top SAS</p>
            </div>
          </section>

          {/* Hosting */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              Hébergement
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-4">
              <p><strong>Amazon Web Services (AWS)</strong></p>
              <p>AWS EMEA SARL</p>
              <p>38 Avenue John F. Kennedy, L-1855 Luxembourg</p>
              <p>Région : eu-west-3 (Paris)</p>
            </div>
          </section>

          {/* Development */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              Développement
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-4">
              <p><strong>Furious Ducks SARL</strong></p>
              <p>12 Rue de la République, 69002 Lyon</p>
              <p>SIRET : 123 456 789 00012</p>
              <p>Email : contact@furiousducks.fr</p>
            </div>
          </section>

          {/* Huissier */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              Huissier de justice
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-4">
              <p><strong>Maître Arnaud RICK</strong></p>
              <p>Huissier de Justice</p>
              <p>15 Rue de la Paix, 75002 Paris</p>
              <p>Le règlement du jeu-concours a été déposé en l'étude.</p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              Propriété intellectuelle
            </h2>
            <p className="font-['Lato'] text-gray-700 leading-relaxed">
              L'ensemble du contenu de ce site (textes, images, vidéos, logos, marques) 
              est la propriété exclusive de Thé Tip Top SAS ou de ses partenaires. 
              Toute reproduction, même partielle, est strictement interdite sans 
              autorisation préalable.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              Contact
            </h2>
            <p className="font-['Lato'] text-gray-700">
              Pour toute question relative au site ou au jeu-concours, vous pouvez nous 
              contacter à l'adresse : support@thetiptop.fr
            </p>
          </section>

          {/* Lottery Rules */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              Règlement du jeu concours
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-4">
              <h3 className="font-semibold text-[#2C5545] text-lg">Article 1 - Organisateur</h3>
              <p>
                Le présent jeu concours est organisé par la société Thé Tip Top SAS, 
                immatriculée au RCS de Paris sous le numéro 123 456 789.
              </p>

              <h3 className="font-semibold text-[#2C5545] text-lg">Article 2 - Durée et modalités</h3>
              <p>
                Le jeu concours se déroule du 1er janvier 2024 au 31 décembre 2024. 
                La participation est gratuite et sans obligation d&apos;achat.
              </p>

              <h3 className="font-semibold text-[#2C5545] text-lg">Article 3 - Conditions de participation</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Être âgé de 18 ans révolus</li>
                <li>Résider en France métropolitaine</li>
                <li>Posséder un code de participation valide</li>
                <li>S&apos;inscrire sur le site www.thetiptop.fr</li>
              </ul>

              <h3 className="font-semibold text-[#2C5545] text-lg">Article 4 - Dotations</h3>
              <p>Les prix à gagner sont les suivants :</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>300 000 infuseurs à thé (60% des codes)</li>
                <li>100 000 boîtes de thé détox 100g (20% des codes)</li>
                <li>50 000 boîtes de thé signature 100g (10% des codes)</li>
                <li>30 000 coffrets découverte 39€ (6% des codes)</li>
                <li>20 000 coffrets premium 69€ (4% des codes)</li>
              </ul>

              <h3 className="font-semibold text-[#2C5545] text-lg">Article 5 - Réclamation des prix</h3>
              <p>
                Les gagnants disposent de 30 jours pour réclamer leur prix en boutique. 
                Passé ce délai, le prix sera considéré comme abandonné.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              Propriété intellectuelle
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-4">
              <p>
                L&apos;ensemble des éléments du site www.thetiptop.fr (textes, images, vidéos, logos, etc.) 
                sont protégés par le droit d&apos;auteur et constituent la propriété exclusive de Thé Tip Top SAS.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication, adaptation de tout ou partie 
                des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, 
                sauf autorisation écrite préalable de Thé Tip Top SAS.
              </p>
            </div>
          </section>

          {/* Personal Data */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              Protection des données personnelles
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-4">
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi 
                &quot;Informatique et Libertés&quot;, vous disposez d&apos;un droit d&apos;accès, de rectification, 
                de suppression et d&apos;opposition au traitement de vos données personnelles.
              </p>
              <p>
                Pour exercer ces droits, vous pouvez nous contacter à l&apos;adresse : 
                <a href="mailto:dpo@thetiptop.fr" className="text-[#D4B254] hover:underline ml-1">
                  dpo@thetiptop.fr
                </a>
              </p>
              <p>
                Pour plus d&apos;informations, consultez notre 
                <Link href="/privacy" className="text-[#D4B254] hover:underline ml-1">
                  politique de confidentialité
                </Link>.
              </p>
            </div>
          </section>

          {/* Liability */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              Responsabilité
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-4">
              <p>
                Thé Tip Top SAS s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations 
                diffusées sur ce site. Toutefois, elle ne peut garantir l&apos;exactitude, la précision ou 
                l&apos;exhaustivité des informations mises à disposition.
              </p>
              <p>
                En conséquence, Thé Tip Top SAS décline toute responsabilité pour toute imprécision, 
                inexactitude ou omission portant sur des informations disponibles sur le site.
              </p>
            </div>
          </section>

          {/* Applicable Law */}
          <section className="mb-12">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              Droit applicable
            </h2>
            <div className="font-['Lato'] text-gray-700">
              <p>
                Les présentes mentions légales sont régies par le droit français. 
                En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-6">
              Contact
            </h2>
            <div className="font-['Lato'] text-gray-700 space-y-2">
              <p>
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
              </p>
              <ul className="space-y-1 ml-4">
                <li>• Par email : <a href="mailto:legal@thetiptop.fr" className="text-[#D4B254] hover:underline">legal@thetiptop.fr</a></li>
                <li>• Par téléphone : +33 1 23 45 67 89</li>
                <li>• Par courrier : 18 rue Léon Frot, 75011 Paris, France</li>
              </ul>
            </div>
          </section>

          {/* Back to Home */}
          <div className="text-center pt-8 border-t border-gray-200">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-[#2C5545] text-white font-['Lato'] font-medium rounded-lg hover:bg-[#1a3329] transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
