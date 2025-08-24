// frontend/cypress/e2e/participation.cy.ts
describe('Jeu-concours Thé Tip Top', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Page d\'accueil', () => {
    it('affiche le titre du jeu-concours', () => {
      cy.contains('10 ans, 10 boutiques').should('be.visible');
      cy.contains('100% gagnant').should('be.visible');
    });

    it('affiche les 5 types de lots', () => {
      cy.contains('Infuseur à thé').should('be.visible');
      cy.contains('Boîte de 100g de thé détox').should('be.visible');
      cy.contains('Boîte de 100g de thé signature').should('be.visible');
      cy.contains('Coffret découverte').should('be.visible');
      cy.contains('Coffret premium').should('be.visible');
    });

    it('affiche le compte à rebours', () => {
      cy.get('[data-testid="countdown"]').should('be.visible');
    });
  });

  describe('Inscription et connexion', () => {
    it('permet l\'inscription avec un formulaire classique', () => {
      cy.visit('/auth');
      cy.get('[data-testid="register-tab"]').click();
      
      cy.get('input[name="firstName"]').type('Jean');
      cy.get('input[name="lastName"]').type('Dupont');
      cy.get('input[name="email"]').type('jean.dupont@test.fr');
      cy.get('input[name="password"]').type('Password123!');
      cy.get('input[name="phone"]').type('0612345678');
      
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('affiche les boutons OAuth Google et Facebook', () => {
      cy.visit('/auth');
      cy.contains('Continuer avec Google').should('be.visible');
      cy.contains('Continuer avec Facebook').should('be.visible');
    });

    it('permet la connexion avec email/mot de passe', () => {
      cy.visit('/auth');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('Password123!');
      cy.get('button[type="submit"]').click();
      
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Participation au jeu', () => {
    beforeEach(() => {
      // Se connecter d'abord
      cy.login('test@example.com', 'Password123!');
    });

    it('permet de saisir un code de 10 caractères', () => {
      cy.visit('/dashboard');
      cy.get('input[data-testid="code-input"]').type('ABC123DEF4');
      cy.get('button[data-testid="validate-code"]').click();
      
      cy.contains('Félicitations').should('be.visible');
    });

    it('rejette les codes invalides', () => {
      cy.visit('/dashboard');
      cy.get('input[data-testid="code-input"]').type('INVALID');
      cy.get('button[data-testid="validate-code"]').click();
      
      cy.contains('Format de code invalide').should('be.visible');
    });

    it('affiche l\'historique des gains', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="history-section"]').should('be.visible');
      cy.get('[data-testid="participation-card"]').should('have.length.at.least', 1);
    });

    it('génère un QR code pour récupérer le gain', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="show-qr-button"]').first().click();
      cy.get('[data-testid="qr-code"]').should('be.visible');
    });
  });

  describe('Interface employé', () => {
    beforeEach(() => {
      cy.login('employe@thetiptop.fr', 'Password123!', 'EMPLOYEE');
    });

    it('permet de rechercher un gain par code', () => {
      cy.visit('/employee');
      cy.get('input[data-testid="search-input"]').type('ABC123DEF4');
      cy.get('button[data-testid="search-button"]').click();
      
      cy.get('[data-testid="gain-details"]').should('be.visible');
    });

    it('permet de marquer un gain comme remis', () => {
      cy.visit('/employee');
      cy.get('input[data-testid="search-input"]').type('ABC123DEF4');
      cy.get('button[data-testid="search-button"]').click();
      
      cy.get('button[data-testid="mark-claimed"]').click();
      cy.contains('Gain marqué comme remis').should('be.visible');
    });
  });

  describe('Back-office administrateur', () => {
    beforeEach(() => {
      cy.login('admin@thetiptop.fr', 'Password123!', 'ADMIN');
    });

    it('affiche les statistiques générales', () => {
      cy.visit('/admin');
      cy.contains('Tickets fournis').should('be.visible');
      cy.contains('Tickets utilisés').should('be.visible');
      cy.contains('Taux participation').should('be.visible');
    });

    it('affiche la répartition des gains', () => {
      cy.visit('/admin');
      cy.get('[data-testid="gains-table"]').should('be.visible');
      cy.contains('60%').should('be.visible'); // Infuseurs
      cy.contains('20%').should('be.visible'); // Détox
      cy.contains('10%').should('be.visible'); // Signature
    });

    it('permet l\'export des emails', () => {
      cy.visit('/admin');
      cy.get('button[data-testid="export-emails"]').click();
      
      // Vérifier que le téléchargement a commencé
      cy.readFile('cypress/downloads/export_emails.csv').should('exist');
    });
  });

  describe('Responsive et accessibilité', () => {
    it('fonctionne sur mobile', () => {
      cy.viewport('iphone-x');
      cy.visit('/');
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
    });

    it('fonctionne sur tablette', () => {
      cy.viewport('ipad-2');
      cy.visit('/');
      cy.contains('100% gagnant').should('be.visible');
    });

    it('respecte les normes WCAG AA', () => {
      cy.injectAxe();
      cy.visit('/');
      cy.checkA11y(null, {
        includedImpacts: ['critical', 'serious'],
        rules: {
          'color-contrast': { enabled: true },
        },
      });
    });
  });

  describe('RGPD et conformité', () => {
    it('affiche les mentions légales', () => {
      cy.visit('/legal');
      cy.contains('Mentions Légales').should('be.visible');
      cy.contains('Thé Tip Top SAS').should('be.visible');
    });

    it('affiche la politique RGPD', () => {
      cy.visit('/legal');
      cy.get('[data-testid="rgpd-tab"]').click();
      cy.contains('Politique de Confidentialité RGPD').should('be.visible');
      cy.contains('Vos droits RGPD').should('be.visible');
    });

    it('affiche le règlement du jeu', () => {
      cy.visit('/legal');
      cy.get('[data-testid="reglement-tab"]').click();
      cy.contains('Maître Arnaud RICK').should('be.visible');
    });
  });
});
