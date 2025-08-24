const sonarqubeScanner = require('sonarqube-scanner');

sonarqubeScanner(
  {
    serverUrl: 'http://localhost:9000',
    login: 'admin',
    password: 'admin',
    options: {
      'sonar.projectKey': 'the-tip-top',
      'sonar.projectName': 'Thé Tip Top - Jeu Concours',
      'sonar.projectVersion': '1.0.0',
      'sonar.sources': 'backend/src,frontend/src',
      'sonar.exclusions': '**/*.test.ts,**/*.spec.ts,**/node_modules/**,**/dist/**,**/coverage/**,**/*.config.js',
      'sonar.tests': 'backend/src/__tests__,frontend/cypress',
      'sonar.test.inclusions': '**/*.test.ts,**/*.spec.ts,**/*.cy.ts',
      'sonar.javascript.lcov.reportPaths': 'backend/coverage/lcov.info,frontend/coverage/lcov.info',
      'sonar.coverage.exclusions': '**/scripts/**,**/migrations/**,**/*.config.js,**/*.config.ts',
      'sonar.typescript.tsconfigPath': 'backend/tsconfig.json,frontend/tsconfig.json',
      'sonar.qualitygate.wait': 'true'
    }
  },
  () => {
    console.log('✅ SonarQube analysis completed successfully!');
    process.exit(0);
  },
  (error) => {
    console.error('❌ SonarQube analysis failed:', error);
    process.exit(1);
  }
);
